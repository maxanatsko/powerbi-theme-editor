import React from 'react';
import { Collapse } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';

const CollapsibleSections = ({ sections, defaultActiveKey = ['1'] }) => {
  const items = sections.map((section, index) => ({
    key: String(index + 1),
    label: <span className="font-medium text-gray-700">{section.title}</span>,
    children: <div className="p-4 bg-white rounded-lg">{section.children}</div>,
    className: 'border-0 mb-2'
  }));

  return (
    <Collapse
      defaultActiveKey={defaultActiveKey}
      expandIcon={({ isActive }) => (
        <CaretRightOutlined rotate={isActive ? 90 : 0} className="text-blue-500" />
      )}
      className="w-full bg-white rounded-lg shadow-sm"
      items={items}
    />
  );
};

export default CollapsibleSections;