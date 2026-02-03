import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
  variant?: 'default' | 'warning' | 'success';
}

export default function DashboardCard({ 
  title, 
  description, 
  icon: Icon, 
  action, 
  children,
  variant = 'default'
}: DashboardCardProps) {
  const variantStyles = {
    default: 'border-border',
    warning: 'border-destructive/50 bg-destructive/5',
    success: 'border-green-500/50 bg-green-500/5',
  };

  return (
    <Card className={`${variantStyles[variant]} transition-all hover:shadow-md`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              {description && <CardDescription className="mt-1">{description}</CardDescription>}
            </div>
          </div>
        </div>
      </CardHeader>
      {(children || action) && (
        <CardContent className="space-y-4">
          {children}
          {action && (
            <Button onClick={action.onClick} className="w-full" size="lg">
              {action.label}
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}
