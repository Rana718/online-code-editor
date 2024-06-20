import React, { useState, useEffect, useRef } from 'react';

const CodeEditor = () => {
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [js, setJs] = useState('');
  const [srcDoc, setSrcDoc] = useState('');
  const [theme, setTheme] = useState('bright');
  const iframeRef = useRef(null);

  useEffect(() => {
    const savedHtml = localStorage.getItem('html');
    const savedCss = localStorage.getItem('css');
    const savedJs = localStorage.getItem('js');
    const savedTheme = localStorage.getItem('theme');

    if (savedHtml) setHtml(savedHtml);
    if (savedCss) setCss(savedCss);
    if (savedJs) setJs(savedJs);
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`
        <html>
          <body>${html}</body>
          <style>${css}</style>
          <script>
            ${js}
            window.addEventListener('DOMContentLoaded', () => {
              const height = document.documentElement.scrollHeight;
              window.parent.postMessage(height, '*');
            });
            window.addEventListener('load', () => {
              const height = document.documentElement.scrollHeight;
              window.parent.postMessage(height, '*');
            });
          </script>
        </html>
      `);
      localStorage.setItem('html', html);
      localStorage.setItem('css', css);
      localStorage.setItem('js', js);
    }, 250);

    return () => clearTimeout(timeout);
  }, [html, css, js]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (typeof event.data === 'number') {
        if (iframeRef.current) {
          iframeRef.current.style.height = `${event.data}px`;
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleDownload = () => {
    const blob = new Blob(
      [
        `
        <html>
          <body>${html}</body>
          <style>${css}</style>
          <script>${js}</script>
        </html>
      `
      ],
      { type: 'text/html' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'code.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearHtml = () => {
    setHtml('');
    localStorage.removeItem('html');
  };

  const handleClearCss = () => {
    setCss('');
    localStorage.removeItem('css');
  };

  const handleClearJs = () => {
    setJs('');
    localStorage.removeItem('js');
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'bright' ? 'dark' : 'bright'));
  };

  return (
    <div className={`max-xl flex flex-col ${theme === 'bright' ? 'bg-gray-50' : 'bg-gray-800 text-white'}`}>
      <div className="p-2 flex space-x-2">
        <button onClick={handleDownload}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 focus:outline-none">
          Download
        </button>
        <button onClick={toggleTheme}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700 focus:outline-none">
          Toggle {theme === 'bright' ? 'Dark' : 'Bright'} Mode
        </button>
      </div>
      <div className="flex-1 flex flex-col lg:flex-row border-b border-gray-300">
        <div className="flex-1 lg:w-1/3 p-2 flex flex-col space-y-2">
          <textarea
            className={`flex-grow w-full p-4 border rounded-lg shadow-sm resize-none min-h-[320px] lg:h-full ${
              theme === 'bright'
                ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                : 'bg-gray-700 text-white border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
            }`}
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="HTML"/>
          <button onClick={handleClearHtml}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 focus:outline-none">
            Clear HTML
          </button>
        </div>
        <div className="flex-1 lg:w-1/3 p-2 flex flex-col space-y-2">
          <textarea
            className={`flex-grow w-full p-4 border rounded-lg shadow-sm resize-none min-h-[320px] lg:h-full ${
              theme === 'bright'
                ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500'
                : 'bg-gray-700 text-white border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500'
            }`}
            value={css}
            onChange={(e) => setCss(e.target.value)}
            placeholder="CSS"/>
          <button onClick={handleClearCss}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 focus:outline-none">
            Clear CSS
          </button>
        </div>
        <div className="flex-1 lg:w-1/3 p-2 flex flex-col space-y-2">
          <textarea
            className={`flex-grow w-full p-4 border rounded-lg shadow-sm resize-none min-h-[320px] lg:h-full ${
              theme === 'bright'
                ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500'
                : 'bg-gray-700 text-white border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500'
            }`}
            value={js}
            onChange={(e) => setJs(e.target.value)}
            placeholder="JavaScript"/>
          <button onClick={handleClearJs}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 focus:outline-none">
            Clear JavaScript
          </button>
        </div>
      </div>
      <div className="flex-1 bg-white shadow-lg rounded-b-lg overflow-hidden">
        <iframe
          ref={iframeRef}
          srcDoc={srcDoc}
          title="output"
          sandbox="allow-scripts allow-modals allow-forms"
          frameBorder="0"
          className="w-full"/>
      </div>
    </div>
  );
};

export default CodeEditor;
