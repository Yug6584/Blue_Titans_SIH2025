import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
} from '@mui/icons-material';

const CardStats = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  trend,
  trendValue,
  loading = false,
  onClick,
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp />;
    if (trend === 'down') return <TrendingDown />;
    return <TrendingFlat />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'success';
    if (trend === 'down') return 'error';
    return 'default';
  };

  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[8],
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box flex={1}>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              {title}
            </Typography>
            
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontWeight: 'bold',
                mb: 1,
                color: loading ? 'text.disabled' : 'text.primary',
              }}
            >
              {loading ? '...' : value}
            </Typography>
            
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            
            {trend && trendValue && (
              <Box display="flex" alignItems="center" mt={1}>
                <Chip
                  icon={getTrendIcon()}
                  label={trendValue}
                  size="small"
                  color={getTrendColor()}
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              </Box>
            )}
          </Box>
          
          {icon && (
            <Avatar
              sx={{
                bgcolor: `${color}.main`,
                width: 56,
                height: 56,
                ml: 2,
              }}
            >
              {icon}
            </Avatar>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CardStats;