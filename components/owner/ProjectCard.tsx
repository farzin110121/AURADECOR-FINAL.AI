import React from 'react';
import { Link } from 'react-router-dom';
// Fix: Corrected import path for Project type.
import { Project } from '../../types/index';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  // Use the first design's image as the thumbnail, or a placeholder
  const thumbnailUrl = project.designs?.[0]?.image_url || project.floorplan_image_url || 'https://via.placeholder.com/400x300.png/050505/D4AF37?text=No+Design';

  return (
    <Link 
        to={`/owner/projects/${project.id}`} 
        className="group block bg-card-bg border border-border-color rounded-xl overflow-hidden hover:border-primary-gold hover:shadow-[0_10px_30px_rgba(212,175,55,0.2)] hover:-translate-y-1 transform transition-all duration-300"
    >
      <div className="aspect-w-16 aspect-h-9">
        <img src={thumbnailUrl} alt={project.name} className="w-full h-40 object-cover" />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg truncate group-hover:text-primary-gold transition-colors">{project.name}</h3>
        <p className="text-sm text-text-muted mt-1">{project.designs.length} design{project.designs.length !== 1 ? 's' : ''}</p>
      </div>
    </Link>
  );
};

export default ProjectCard;