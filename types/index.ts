
export type UserRole = 'owner' | 'supplier' | 'admin';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  phone_number: string | null;
}

// Corresponds to MaterialBreakdownItem in the studio
export interface MaterialData {
    name: string;
    description: string;
}

// Corresponds to Design in the studio, but with a public URL for the image
export interface DesignData {
  id: number; // DB id
  title: string;
  image_url: string; 
  materials: MaterialData[];
  prompt: string;
}

export interface Project {
  id: number;
  name: string;
  owner_id: number;
  floorplan_image_url: string | null;
  // This will store the JSON from the floorplan analysis
  analysis_result: object | null; 
  designs: DesignData[];
}

export interface SupplierProfile {
  user_id: number;
  company_name: string;
  city: string;
  whatsapp_number: string;
  services: string[];
  portfolio_images: string[];
}
