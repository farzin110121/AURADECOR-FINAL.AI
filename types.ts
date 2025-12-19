
export enum AppState {
  UPLOAD = 'UPLOAD',
  SELECT_ROOM = 'SELECT_ROOM',
  DESIGN = 'DESIGN',
}

export interface Feature {
  id: string; // e.g., 'W1', 'D1', 'E1'
  type: 'window' | 'door' | 'equipment';
  name?: string; // For equipment, e.g., "sink", "fireplace"
  description: string; // e.g., "Large window in the center of the S wall"
}

export interface Room {
  name: string;
  size: string; // e.g., "4x3m"
  walls: {
    N: string;
    S: string;
    E: string;
    W: string;
  };
  entry: string; // e.g., "W"
  features: Feature[];
}

export interface FloorplanAnalysis {
  rooms: Room[];
}

export interface MaterialBreakdownItem {
    name: string;
    description: string;
}

export interface Design {
  id: string;
  title: string;
  imageUrl: string;
  materials: MaterialBreakdownItem[];
  prompt: string;
}

export interface SupplierRequest {
    room: string;
    materials: { [key: string]: string }[];
}

export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}
