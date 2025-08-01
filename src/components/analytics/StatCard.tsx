'use client';

import {
  Box,
  Card,
  CardContent,
  Typography,
  SvgIconProps,
} from '@mui/material';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
}

export function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 1,
              borderRadius: '50%',
              bgcolor: color ? `${color}.light` : 'primary.light',
              color: color ? `${color}.main` : 'primary.main',
            }}
          >
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
        {trend && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="body2"
              color={trend.positive ? 'success.main' : 'error.main'}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              {trend.label}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
