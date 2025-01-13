import React, { useState } from 'react';
import { Layout, Select, ConfigProvider, theme } from 'antd';
import ThemeForm from './components/ThemeForm';
import PerformanceMonitor from './components/PerformanceMonitor';

const { Header, Content } = Layout;

function App() {
  const [themeMode, setThemeMode] = useState('light');
  
  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' }
  ];

  // Configure theme algorithm based on mode
  const algorithm = themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm;

  return (
    <ConfigProvider
      theme={{
        algorithm: algorithm,
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '0 24px',
          background: themeMode === 'dark' ? '#141414' : '#fff'
        }}>
          <h1 style={{ 
            margin: 0,
            color: themeMode === 'dark' ? '#fff' : '#000'
          }}>
            Power BI Theme Editor
          </h1>
          <div>
            <span style={{ 
              marginRight: 8, 
              color: themeMode === 'dark' ? '#fff' : '#000' 
            }}>
              Theme:
            </span>
            <Select
              value={themeMode}
              onChange={setThemeMode}
              options={themeOptions}
              style={{ width: 120 }}
            />
          </div>
        </Header>
        <Content style={{ padding: 24, background: themeMode === 'dark' ? '#000' : '#f0f2f5' }}>
          <ThemeForm />
        </Content>
        <PerformanceMonitor />
      </Layout>
    </ConfigProvider>
  );
}

export default React.memo(App);