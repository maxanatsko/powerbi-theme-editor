import React, { useState, useCallback, useMemo } from 'react';
import { Collapse } from 'antd';

const ObjectField = React.memo(({ title, required, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Memoize header content
  const header = useMemo(() => (
    <span className="font-medium">
      {title}
      {required && <span className="text-red-500 ml-1">*</span>}
    </span>
  ), [title, required]);

  // Memoize the onChange handler
  const onChange = useCallback((key) => {
    setIsExpanded(key.length > 0);
  }, []);

  // Only render children when expanded
  return (
    <Collapse
      onChange={onChange}
      className="border rounded-md overflow-hidden"
    >
      <Collapse.Panel header={header} key="1">
        {isExpanded && children}
      </Collapse.Panel>
    </Collapse>
  );
});

ObjectField.displayName = 'ObjectField';

export default ObjectField;