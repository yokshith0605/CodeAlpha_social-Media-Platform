export interface PhotoPreset {
  id: string;
  name: string;
  url: string;
  category: string;
}

export const PHOTO_PRESETS: PhotoPreset[] = [
  {
    id: 'architecture',
    name: 'Minimal Architecture Pavilion',
    url: '/src/assets/images/minimal_architecture_post_1791625798233.jpg',
    category: 'Architecture',
  },
  {
    id: 'workspace',
    name: 'Clean Studio Desk & Espresso',
    url: '/src/assets/images/design_workspace_post_1791625823670.jpg',
    category: 'Design & Code',
  },
  {
    id: 'street',
    name: 'Rainy Tokyo Dusk Alley',
    url: '/src/assets/images/urban_street_post_1791625812078.jpg',
    category: 'Street Documentary',
  },
  {
    id: 'nature',
    name: 'Pacific Northwest Sea Fog',
    url: '/src/assets/images/coastal_fog_post_1791625835737.jpg',
    category: 'Landscape',
  },
];

export const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
];
