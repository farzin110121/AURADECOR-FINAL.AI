
import React, { useState, useEffect } from 'react';
import { Project } from '../../types/index';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ProjectCard from '../../components/owner/ProjectCard';

const OwnerDashboard: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                const response = await api.get('/projects/'); 
                setProjects(response.data);
            } catch (error) {
                console.error("Failed to fetch projects", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const aiStudioUrl = token 
        ? `/public/ai-studio/index.html?token=${token}` 
        : '/login';

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold font-display">My Projects</h1>
                <a 
                    href={aiStudioUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-6 py-2 font-semibold rounded-full text-black bg-gradient-to-r from-primary-gold to-secondary-gold hover:shadow-[0_5px_20px_rgba(212,175,55,0.4)] transform hover:-translate-y-0.5 transition-all"
                >
                    + New Project
                </a>
            </div>
            
            <div className="bg-card-bg border border-border-color rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
                {loading ? (
                    <p className="text-text-muted">Loading projects...</p>
                ) : projects.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-text-muted">You don't have any projects yet.</p>
                        <p className="text-sm text-text-muted/70 mt-2">Click "+ New Project" to generate your first design using our AI Studio.</p>
                        <p className="text-sm text-text-muted/70 mt-1">After creating a design, you can save it here from the studio.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(project => (
                           <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnerDashboard;
