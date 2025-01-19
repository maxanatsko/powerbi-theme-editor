const JsonViewer = ({ data, className = '' }) => {
  return (
    <div className={`flex-[4] border-l pl-6 border-theme-light-border-default dark:border-theme-dark-border-default ${className}`}>
      <div className="sticky top-0 pt-4">
        <h2 className="text-lg font-semibold mb-4 text-theme-light-text-primary dark:text-theme-dark-text-primary">
          JSON
        </h2>
        <pre 
          className="p-4 rounded border text-sm font-mono overflow-auto max-h-[calc(100vh-12rem)]
                     bg-theme-light-bg-surface dark:bg-theme-dark-bg-surface
                     text-theme-light-text-primary dark:text-theme-dark-text-primary
                     border-theme-light-border-default dark:border-theme-dark-border-default
                     break-all whitespace-pre-wrap [overflow-wrap:anywhere]"
        >
          {JSON.stringify(data || {}, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default JsonViewer;