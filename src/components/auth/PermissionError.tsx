import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import { Security, ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface PermissionErrorProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
}

export function PermissionError({
  title = 'Access Denied',
  message = 'You do not have permission to access this resource.',
  showBackButton = true,
}: PermissionErrorProps) {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        p: 3,
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <Security sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            {title}
          </Typography>
          <Alert severity="error" sx={{ mb: 3 }}>
            {message}
          </Alert>
          {showBackButton && (
            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={() => router.back()}
            >
              Go Back
            </Button>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
