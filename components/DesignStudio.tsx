
import React, { useState, useCallback, useMemo } from 'react';
import { Room, Design, MaterialBreakdownItem, ChatMessage, SupplierRequest } from '../types';
import { generateDesignAids, generateImage, refineImage, generateSupplierPackage, getDesignAdvice, correctArchitecture } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import Loader from './Loader';
import SparklesIcon from './icons/SparklesIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';

interface DesignStudioProps {
  room: Room;
  onBack: () => void;
}

const DESIGN_STYLES = [
  "Modern Minimalist",
  "Scandinavian",
  "Bohemian",
  "Industrial",
  "Coastal",
  "Farmhouse",
  "Mid-Century Modern",
  "Art Deco",
  "Luxury"
];

type Tab = 'design' | 'materials' | 'album' | 'chat';

const DesignStudio: React.FC<DesignStudioProps> = ({ room, onBack }) => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [currentDesignIndex, setCurrentDesignIndex] = useState<number | null>(null);
  const [stylePrompt, setStylePrompt] = useState<string>('');
  const [refinementPrompt, setRefinementPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('design');
  
  const [currentRoom, setCurrentRoom] = useState<Room>(room);

  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [supplierPackage, setSupplierPackage] = useState<SupplierRequest | null>(null);
  const [selectedDesigns, setSelectedDesigns] = useState<Set<string>>(new Set());


  const currentDesign = currentDesignIndex !== null ? designs[currentDesignIndex] : null;

  const handleToggleSelectDesign = (designId: string) => {
    setSelectedDesigns(prevSelected => {
        const newSelected = new Set(prevSelected);
        if (newSelected.has(designId)) {
            newSelected.delete(designId);
        } else {
            if (newSelected.size < 3) {
                newSelected.add(designId);
            }
        }
        return newSelected;
    });
  };

  const handleDownloadSelected = () => {
    designs.forEach(design => {
        if (selectedDesigns.has(design.id)) {
            const link = document.createElement('a');
            link.href = design.imageUrl;
            link.download = `AURADECOR-Design-${design.title.replace(/\s+/g, '_')}-${design.id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });
  };


  const handleGenerate = useCallback(async (options: { isRefinement?: boolean, chatRefinement?: string | null, roomOverride?: Room }) => {
    const { isRefinement = false, chatRefinement = null, roomOverride = null } = options;
    const roomToUse = roomOverride || currentRoom;

    const promptToUse = chatRefinement || (isRefinement ? refinementPrompt : stylePrompt);
    if (!promptToUse && !chatRefinement) return;
    
    setIsLoading(true);
    setError(null);
    setLoadingMessage(isRefinement ? 'Refining your design...' : 'Generating design concepts...');

    try {
        const designAids = await generateDesignAids(roomToUse, stylePrompt, chatRefinement || (isRefinement ? refinementPrompt : null));
        
        setLoadingMessage('Rendering photorealistic image...');

        let imageBase64;
        if (isRefinement && currentDesign) {
             const response = await fetch(currentDesign.imageUrl);
             const blob = await response.blob();
             const previousImageBase64 = await fileToBase64(new File([blob], "previous.png", {type: "image/png"}));
             imageBase64 = await refineImage(designAids.imagePrompt, previousImageBase64);
        } else {
             imageBase64 = await generateImage(designAids.imagePrompt);
        }

        const newDesign: Design = {
            id: `v${designs.length + 1}`,
            title: designAids.albumTitle || `Version ${designs.length + 1}`,
            imageUrl: `data:image/png;base64,${imageBase64}`,
            materials: designAids.materialBreakdown,
            prompt: designAids.imagePrompt,
        };
        
        setDesigns(prev => [...prev, newDesign]);
        setCurrentDesignIndex(designs.length);
        setRefinementPrompt('');
        if (chatRefinement) setActiveTab('design');

    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  }, [currentRoom, stylePrompt, refinementPrompt, designs, currentDesign]);

  const handleChatSubmit = async () => {
    const userInput = chatInput.trim();
    if(!userInput) return;

    if (!currentDesign) {
        setChatHistory(prev => [...prev, { sender: 'user', text: userInput }, { sender: 'ai', text: "Please generate a design first, then you can ask me to refine it!" }]);
        setChatInput('');
        return;
    }

    const newUserMessage: ChatMessage = { sender: 'user', text: userInput };
    setChatHistory(prev => [...prev, newUserMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
        const featureIds = currentRoom.features.map(f => f.id);
        const isArchitecturalChange = featureIds.some(id => userInput.includes(id)) && ['move', 'change', 'is on', 'should be', 'add', 'remove', 'relocate'].some(keyword => userInput.toLowerCase().includes(keyword));

        if (isArchitecturalChange) {
            setLoadingMessage('Updating architecture...');
            setIsLoading(true);
            const newRoomData = await correctArchitecture(currentRoom, userInput);
            setCurrentRoom(newRoomData);
            setChatHistory(prev => [...prev, { sender: 'ai', text: "I've updated the room's architecture. Now, I'm regenerating the design with this correction." }]);
            await handleGenerate({ isRefinement: true, chatRefinement: userInput, roomOverride: newRoomData });
        } else {
            const geminiHistory = [...chatHistory, newUserMessage].map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));
            const aiAdvice = await getDesignAdvice(geminiHistory);
            setChatHistory(prev => [...prev, { sender: 'ai', text: aiAdvice }]);
            await handleGenerate({ isRefinement: true, chatRefinement: userInput });
        }
    } catch (err) {
       setError(err instanceof Error ? err.message : 'An unknown error occurred.');
       setChatHistory(prev => [...prev, { sender: 'ai', text: "Sorry, I encountered an error. Please try rephrasing your request." }]);
    } finally {
        setIsChatLoading(false);
        setIsLoading(false);
    }
  };

  const handleRequestQuotes = async () => {
      if(!currentDesign) return;
      setIsLoading(true);
      setLoadingMessage("Preparing supplier package...")
      try {
          const pkg = await generateSupplierPackage(currentRoom.name, currentDesign.materials);
          setSupplierPackage(pkg);
          setShowSupplierModal(true);
      } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
          setIsLoading(false);
      }
  };
  
  const featureLegend = useMemo(() => {
    return currentRoom.features.map(f => `${f.id}: ${f.description}`).join('; ');
  }, [currentRoom]);

  return (
    <div>
        <button onClick={onBack} className="flex items-center text-sm text-[#aaaaaa] hover:text-[#D4AF37] mb-6 transition-colors">
            <ChevronLeftIcon className="w-5 h-5 mr-1" />
            Back to Room Selection
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-[rgba(255,255,255,0.03)] border border-[rgba(212,175,55,0.25)] rounded-xl p-4 flex items-center justify-center min-h-[60vh]">
                {isLoading ? (
                    <Loader message={loadingMessage} />
                ) : currentDesign ? (
                    <img src={currentDesign.imageUrl} alt={currentDesign.title} className="max-w-full max-h-[80vh] rounded-lg object-contain" />
                ) : (
                    <div className="text-center text-[#aaaaaa]">
                        <h3 className="text-xl font-semibold text-white">Your design will appear here.</h3>
                        <p>Describe the style you want in the panel to the right to get started.</p>
                    </div>
                )}
            </div>

            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(212,175,55,0.25)] rounded-xl p-6 flex flex-col h-[85vh]">
                <div className="flex-shrink-0">
                    <h2 className="text-3xl font-bold capitalize font-display gold-gradient-text">{currentRoom.name.replace('_', ' ')} Design Studio</h2>
                    <div className="border-b border-[rgba(212,175,55,0.25)] mt-4">
                        <nav className="-mb-px flex space-x-6">
                           {(['design', 'materials', 'album', 'chat'] as Tab[]).map(tab => (
                               <button key={tab} onClick={() => setActiveTab(tab)} className={`capitalize py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab ? 'border-[#D4AF37] text-white' : 'border-transparent text-[#aaaaaa] hover:text-white hover:border-gray-700'}`}>
                                   {tab}
                                   {tab === 'album' && <span className="ml-2 bg-gray-700 text-gray-200 text-xs font-bold px-2 py-0.5 rounded-full">{designs.length}</span>}
                                </button>
                           ))}
                        </nav>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto mt-6 min-h-0">
                    {error && <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 text-red-300 rounded-lg text-sm">{error}</div>}
                    
                    {activeTab === 'design' && (
                        <div>
                             {!currentDesign ? (
                                <>
                                <label htmlFor="style-select" className="block text-sm font-medium text-[#aaaaaa]">Select Design Style</label>
                                <select
                                  id="style-select"
                                  value={stylePrompt}
                                  onChange={e => setStylePrompt(e.target.value)}
                                  className="mt-1 block w-full rounded-md bg-black/30 border border-[rgba(212,175,55,0.25)] shadow-sm py-2 px-3 focus:border-[#D4AF37] focus:ring-[#D4AF37] sm:text-sm"
                                >
                                  <option value="" disabled>Choose a style...</option>
                                  {DESIGN_STYLES.map(style => (
                                    <option key={style} value={style} className="bg-[#050505]">{style}</option>
                                  ))}
                                </select>
                                
                                <button onClick={() => handleGenerate({})} disabled={!stylePrompt || isLoading} className="mt-6 w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-semibold rounded-full shadow-sm text-black bg-gradient-to-r from-[#D4AF37] to-[#F1C40F] hover:shadow-[0_5px_20px_rgba(212,175,55,0.4)] transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed">
                                    <SparklesIcon className="w-5 h-5 mr-2" />
                                    Generate Design
                                </button>
                                </>
                             ) : (
                                <>
                                <label htmlFor="refinement" className="block text-sm font-medium text-[#aaaaaa]">Refine Your Design</label>
                                <textarea id="refinement" rows={4} value={refinementPrompt} onChange={e => setRefinementPrompt(e.target.value)} className="mt-1 block w-full rounded-md bg-black/30 border border-[rgba(212,175,55,0.25)] shadow-sm focus:border-[#D4AF37] focus:ring-[#D4AF37] sm:text-sm placeholder:text-gray-500" placeholder="e.g., change the floor to dark wood, add brass fittings"></textarea>
                                
                                <button onClick={() => handleGenerate({isRefinement: true})} disabled={!refinementPrompt || isLoading} className="mt-6 w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-semibold rounded-full shadow-sm text-black bg-gradient-to-r from-[#D4AF37] to-[#F1C40F] hover:shadow-[0_5px_20px_rgba(212,175,55,0.4)] transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed">
                                    <SparklesIcon className="w-5 h-5 mr-2" />
                                    Refine
                                </button>
                                <button onClick={() => { setCurrentDesignIndex(null); setStylePrompt(''); }} className="mt-4 w-full text-center text-sm text-[#aaaaaa] hover:text-[#D4AF37] hover:underline">Start a new design concept</button>
                                </>
                             )}
                        </div>
                    )}

                    {activeTab === 'materials' && (
                        <div>
                            {!currentDesign ? <p className="text-[#aaaaaa] text-sm">Generate a design to see its material breakdown.</p> : (
                                <>
                                <h3 className="font-semibold mb-3 text-white">Material Breakdown for "{currentDesign.title}"</h3>
                                <ul className="space-y-2">
                                    {currentDesign.materials.map((item, index) => (
                                        <li key={index} className="flex justify-between p-3 bg-black/30 border border-transparent rounded-md text-sm">
                                            <span className="font-medium text-gray-300 capitalize">{item.name}</span>
                                            <span className="text-[#aaaaaa] text-right">{item.description}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={handleRequestQuotes} disabled={isLoading} className="mt-6 w-full text-sm font-medium rounded-full border-2 border-[#D4AF37] text-[#D4AF37] bg-[rgba(212,175,55,0.1)] hover:bg-[rgba(212,175,55,0.2)] hover:shadow-[0_5px_20px_rgba(212,175,55,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 py-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    Request Quotes
                                </button>
                                </>
                            )}
                        </div>
                    )}

                     {activeTab === 'album' && (
                        <div>
                            <div className="grid grid-cols-2 gap-4">
                                {!designs.length ? <p className="text-[#aaaaaa] text-sm col-span-2">Your generated designs will appear here.</p> : designs.map((design, index) => {
                                    const isSelected = selectedDesigns.has(design.id);
                                    const canSelectMore = selectedDesigns.size < 3;
                                    return (
                                    <div key={design.id} className="relative group">
                                        <button
                                            onClick={() => setCurrentDesignIndex(index)}
                                            className={`rounded-lg overflow-hidden block w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050505] transition-all ${currentDesignIndex === index ? 'ring-2 ring-[#D4AF37]' : ''} ${isSelected ? 'ring-2 ring-[#F1C40F]' : 'ring-0'}`}
                                        >
                                            <img src={design.imageUrl} alt={design.title} className="w-full h-24 object-cover" />
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end p-2">
                                                <p className="text-white text-xs font-bold">{design.title}</p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => handleToggleSelectDesign(design.id)}
                                            disabled={!isSelected && !canSelectMore}
                                            className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full transition-all text-black ${
                                                isSelected
                                                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#F1C40F]'
                                                    : 'bg-white/70 hover:bg-white'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {isSelected ? 'Selected' : 'Select'}
                                        </button>
                                    </div>
                                    )
                                })}
                            </div>

                            {selectedDesigns.size > 0 && (
                                <div className="mt-6">
                                    <button
                                        onClick={handleDownloadSelected}
                                        className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-semibold rounded-full shadow-sm text-black bg-gradient-to-r from-[#D4AF37] to-[#F1C40F] hover:shadow-[0_5px_20px_rgba(212,175,55,0.4)] transform hover:-translate-y-0.5 transition-all"
                                    >
                                        Download {selectedDesigns.size} Selected Image{selectedDesigns.size > 1 ? 's' : ''}
                                    </button>
                                </div>
                            )}
                        </div>
                     )}

                    {activeTab === 'chat' && (
                        <div className="flex flex-col h-full">
                           <div className="flex-grow space-y-4 overflow-y-auto pr-2 pb-4">
                            {chatHistory.length === 0 && <p className="text-[#aaaaaa] text-sm">Generate a design, then ask me to refine it! e.g., "Make the walls a lighter shade of blue."</p>}
                               {chatHistory.map((msg, i) => (
                                   <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                       <p className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-gradient-to-r from-[#D4AF37] to-[#F1C40F] text-black font-medium' : 'bg-[#1a1a1a] text-gray-200'}`}>{msg.text}</p>
                                   </div>
                               ))}
                               {isChatLoading && <div className="flex justify-start"><p className="px-4 py-2 rounded-lg text-sm bg-[#1a1a1a] text-gray-400 italic">Thinking...</p></div>}
                           </div>
                           <div className="mt-auto flex-shrink-0 pt-4 border-t border-[rgba(212,175,55,0.25)]">
                               <div className="text-xs text-[#aaaaaa] mb-2 p-2 bg-black/30 rounded">
                                 <b className="text-gray-300">Architectural Legend:</b> {featureLegend}
                               </div>
                               <div className="flex space-x-2">
                                   <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChatSubmit()} placeholder="e.g., 'Move W1 to the N wall'" className="flex-grow block w-full rounded-full bg-black/30 border border-[rgba(212,175,55,0.25)] shadow-sm focus:border-[#D4AF37] focus:ring-[#D4AF37] sm:text-sm placeholder:text-gray-500"/>
                                   <button onClick={handleChatSubmit} disabled={isChatLoading || isLoading} className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#F1C40F] text-black rounded-full text-sm font-semibold hover:shadow-[0_5px_20px_rgba(212,175,55,0.4)] transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:shadow-none disabled:transform-none">Send</button>
                               </div>
                           </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        {showSupplierModal && supplierPackage && (
            <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-20" onClick={() => setShowSupplierModal(false)}>
                <div className="bg-[#0a0a0a] border border-[rgba(212,175,55,0.25)] rounded-lg shadow-xl p-8 max-w-lg w-full" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-bold font-display gold-gradient-text mb-4">Supplier Request Package</h3>
                    <p className="text-sm text-[#aaaaaa] mb-4">You can copy this package and send it to your suppliers for quotes.</p>
                    <pre className="bg-black/50 p-4 rounded-md text-sm text-gray-300 overflow-x-auto">
                        {JSON.stringify(supplierPackage, null, 2)}
                    </pre>
                    <button onClick={() => setShowSupplierModal(false)} className="mt-6 w-full text-sm font-semibold rounded-full border-2 border-[#D4AF37] text-[#D4AF37] bg-[rgba(212,175,55,0.1)] hover:bg-[rgba(212,175,55,0.2)] hover:shadow-[0_5px_20px_rgba(212,175,55,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 py-2">Close</button>
                </div>
            </div>
        )}
    </div>
  );
};

export default DesignStudio;
