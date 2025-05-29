import React from 'react';
import { memo } from 'react';
import { BarChart3, CreditCard, Package, FileText, Settings } from 'lucide-react';

const TabButton = memo(({ active, icon: Icon, label, onClick }) => (
  <button 
    onClick={onClick} 
    className={`btn ${active ? 'btn-primary' : 'btn-ghost'} rounded-full transition-all duration-300`}
  >
    <Icon className="w-4 h-4 mr-2" />
    {label}
  </button>
));

TabButton.displayName = 'TabButton';

const DashboardTabs = memo(({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'overview', label: '개요', icon: BarChart3 },
    { id: 'subscriptions', label: '구독 관리', icon: CreditCard },
    { id: 'tools', label: 'AI 툴', icon: Package },
    { id: 'reports', label: '리포트', icon: FileText },
    { id: 'settings', label: '설정', icon: Settings }
  ];

  return (
    <div className="mb-8">
      <div className="flex overflow-x-auto gap-2 pb-2">
        {tabs.map(tab => (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            icon={tab.icon}
            label={tab.label}
            onClick={() => onTabChange(tab.id)}
          />
        ))}
      </div>
    </div>
  );
});

DashboardTabs.displayName = 'DashboardTabs';

export default DashboardTabs; 