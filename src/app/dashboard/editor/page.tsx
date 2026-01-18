'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Play, Bot } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const initialCode = `// Welcome to the CodeGenius Editor!
// Write your JavaScript code here and click 'Run'.

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('CodeGenius User'));
`;

export default function EditorPage() {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');

  const handleRunCode = () => {
    // In a real app, this would involve a secure execution environment.
    // For this demo, we'll simulate a simple JavaScript execution.
    if (language === 'javascript') {
      try {
        let capturedOutput = '';
        const originalLog = console.log;
        console.log = (...args) => {
          capturedOutput += args.map(String).join(' ') + '\\n';
        };
        // Using Function constructor for sandboxing is not perfectly secure,
        // but better than direct eval for a demo.
        new Function(code)();
        console.log = originalLog;
        setOutput(capturedOutput || 'Code executed successfully with no output.');
      } catch (error) {
        if (error instanceof Error) {
          setOutput(`Error: ${error.message}`);
        } else {
          setOutput('An unknown error occurred.');
        }
      }
    } else {
      setOutput(`Running ${language} is not supported in this demo editor.`);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Code Editor
          </h1>
          <p className="text-muted-foreground">
            Write, run, and test your code snippets in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python" disabled>Python</SelectItem>
              <SelectItem value="html" disabled>HTML</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRunCode}>
            <Play className="mr-2 h-4 w-4" />
            Run
          </Button>
        </div>
      </div>
      <div className="grid h-[calc(100vh-12rem)] grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>{language.charAt(0).toUpperCase() + language.slice(1)}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your code here..."
              className="h-full w-full resize-none font-code text-sm"
            />
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Output</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <pre className="h-full w-full rounded-md bg-muted p-4 font-code text-sm">
              {output ? (
                <code>{output}</code>
              ) : (
                <span className="text-muted-foreground">
                  Click 'Run' to see the output of your code.
                </span>
              )}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
