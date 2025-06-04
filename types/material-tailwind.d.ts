// types/material-tailwind.d.ts
declare module '@material-tailwind/react' {
    import { ComponentType, ReactNode } from 'react';
  
    export const Typography: ComponentType<{
      variant?: string;
      color?: string;
      className?: string;
      children: ReactNode;
    }>;
  
    export const Card: ComponentType<{
      color?: string;
      shadow?: boolean;
      className?: string;
      children: ReactNode;
    }>;
  
    export const CardHeader: ComponentType<{
      floated?: boolean;
      className?: string;
      children: ReactNode;
    }>;
  
    export const CardBody: ComponentType<{
      className?: string;
      children: ReactNode;
    }>;
  
    export const Button: ComponentType<{
      color?: string;
      size?: string;
      className?: string;
      children: ReactNode;
    }>;
  
    // Add other components as needed
  }