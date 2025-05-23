import { IconButton, IconButtonProps, Badge, BadgeProps } from '@mui/material';
import { ReactElement } from 'react';

type IconButtonWithBadgeProps = {
  icon: ReactElement;
  badgeContent?: number;
  badgeColor?: BadgeProps['color'];
} & IconButtonProps;

export const IconButtonWithBadge = ({
  icon,
  badgeContent,
  badgeColor = 'secondary',
  ...props
}: IconButtonWithBadgeProps) => {
  return (
    <IconButton 
      {...props}
      sx={{
        width: 40,
        height: 40,
        borderRadius: '4px',
        padding: '8px',
        ...props.sx,
      }}
    >
      {badgeContent ? (
        <Badge 
          badgeContent={badgeContent} 
          color={badgeColor}
          sx={{
            '& .MuiBadge-badge': {
              right: -3,
              top: -3,
              border: '2px solid white',
              padding: '0 4px',
            },
          }}
        >
          {icon}
        </Badge>
      ) : (
        icon
      )}
    </IconButton>
  );
};