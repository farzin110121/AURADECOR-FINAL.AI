import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// Fix: Corrected import path for Project and DesignData types.
import { Project, DesignData } from '../../types/index';
import api from '../../services/api';
import ChevronLeftIcon from '../../components/icons/ChevronLeftIcon';

const ProjectPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDesign, setSelectedDesign] = useState<DesignData | null>(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await api.get(`/projects/${projectId}`);
                setProject(response.data);
                if (response.data.designs && response.data.designs.length > 0) {
                    setSelectedDesign(response.data.designs[0]);
                }
            } catch (err) {
                setError("Failed to fetch project details.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [projectId]);

    if (loading) {
        return <div className="text-center text-text-muted">Loading project...</div>;
    }

    if (error) {
        return <div className="text-center text-red-400">{error}</div>;
    }

    if (!project) {
        return <div className="text-center text-text-muted">Project not found.</div>;
    }

    return (
        <div>
            <Link to="/owner/dashboard" className="flex items-center text-sm text-text-muted hover:text-primary-gold mb-6 transition-colors">
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                Back to Dashboard
            </Link>
            
            <h1 className="text-4xl font-bold font-display gold-gradient-text mb-2">{project.name}</h1>
            <p className="text-text-muted mb-8">Review your generated designs and materials.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-card-bg border border-border-color rounded-xl p-4 flex items-center justify-center min-h-[60vh]">
                    {selectedDesign ? (
                        <img src={selectedDesign.image_url} alt={selectedDesign.title} className="max-w-full max-h-[80vh] rounded-lg object-contain" />
                    ) : (
                        <p className="text-text-muted">No designs available for this project.</p>
                    )}
                </div>

                <div className="bg-card-bg border border-border-color rounded-xl p-6 h-full">
                    <h2 className="text-2xl font-bold font-display text-white mb-4">Designs ({project.designs.length})</h2>
                    <div className="space-y-4">
                        {project.designs.map((design) => (
                            <button key={design.id} onClick={() => setSelectedDesign(design)} className={`w-full text-left p-3 rounded-lg flex items-center gap-4 transition-colors ${selectedDesign?.id === design.id ? 'bg-primary-gold/10 ring-1 ring-primary-gold' : 'hover:bg-primary-gold/5'}`}>
                                <img src={design.image_url} alt={design.title} className="w-20 h-16 object-cover rounded-md" />
                                <div>
                                    <h3 className={`font-semibold ${selectedDesign?.id === design.id ? 'text-primary-gold' : 'text-text-light'}`}>{design.title}</h3>
                                    <p className="text-sm text-text-muted">{design.materials.length} materials</p>
                                </div>
                            </button>
                        ))}
                    </div>

                     {selectedDesign && (
                        <div className="mt-8 pt-6 border-t border-border-color">
                            <h3 className="font-semibold text-white mb-3">Material Breakdown for "{selectedDesign.title}"</h3>
                            <ul className="space-y-2 text-sm">
                                {selectedDesign.materials.map((item, index) => (
                                    <li key={index} className="flex justify-between p-2 bg-black/30 rounded-md">
                                        <span className="font-medium text-gray-300 capitalize">{item.name}</span>
                                        <span className="text-text-muted text-right">{item.description}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectPage;