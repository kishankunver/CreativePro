import React from 'react';
import { Shield, CheckCircle, Star, Building, Rocket, GraduationCap, DollarSign } from 'lucide-react';
import { VerificationBadge as VerificationBadgeType } from '../types';
import { verificationService } from '../services/verification';

interface VerificationBadgeProps {
  badge: VerificationBadgeType;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ 
  badge, 
  size = 'md', 
  showTooltip = true 
}) => {
  const badgeInfo = verificationService.getVerificationBadgeInfo(badge);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const getIcon = () => {
    switch (badge.type) {
      case 'company':
        return <Building className={iconSizes[size]} />;
      case 'founder':
        return <Rocket className={iconSizes[size]} />;
      case 'investor':
        return <DollarSign className={iconSizes[size]} />;
      case 'expert':
        return <Star className={iconSizes[size]} />;
      case 'academic':
        return <GraduationCap className={iconSizes[size]} />;
      default:
        return <CheckCircle className={iconSizes[size]} />;
    }
  };

  return (
    <div className="relative group">
      <div className={`
        inline-flex items-center space-x-1 rounded-full font-medium
        ${badgeInfo.color} ${sizeClasses[size]}
      `}>
        {getIcon()}
        <span>{badgeInfo.label}</span>
        {badge.credibilityScore >= 90 && (
          <Shield className={`${iconSizes[size]} text-yellow-600`} />
        )}
      </div>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10">
          <div className="font-medium">{badgeInfo.description}</div>
          {badge.companyName && (
            <div className="text-gray-300">{badge.companyName}</div>
          )}
          {badge.title && (
            <div className="text-gray-300">{badge.title}</div>
          )}
          <div className="text-gray-400">
            Credibility: {badge.credibilityScore}/100
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default VerificationBadge;