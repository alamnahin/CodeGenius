'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  generateCodeFromDescription,
  type GenerateCodeFromDescriptionOutput,
} from '@/ai/flows/generate-code-from-description';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  language: z.string().min(1, 'Please select a language.'),
  description: z.string().min(10, 'Please describe the code you want to generate.'),
});

type FormValues = z.infer<typeof formSchema>;

function CodeBlock({ code }: { code: string }) {
  const [hasCopied, setHasCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code).then(() => {
      setHasCopied(true);
      toast({ title: 'Copied!', description: 'Code copied to clipboard.' });
      setTimeout(() => setHasCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to copy code to clipboard.',
      });
    });
  };

  return (
    <div className="relative">
      <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm font-code">
        <code>{code}</code>
      </pre>
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 h-8 w-8"
        onClick={copyToClipboard}
      >
        {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}

export default function CodeGeneratorPage() {
  const [generatedCode, setGeneratedCode] =
    useState<GenerateCodeFromDescriptionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: 'javascript',
      description: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setGeneratedCode(null);
    try {
      const result = await generateCodeFromDescription(values);
      setGeneratedCode(result);
    } catch (error) {
      console.error('Failed to generate code:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          'There was an error generating your code. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          AI Code Generator
        </h1>
        <p className="text-muted-foreground">
          Describe what you want to build, and let our AI write the code for
          you.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Code Request</CardTitle>
              <CardDescription>
                Provide details for the code snippet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="e.g., JavaScript" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="typescript">TypeScript</SelectItem>
                            <SelectItem value="html">HTML</SelectItem>
                            <SelectItem value="css">CSS</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., A button that changes color on click"
                            {...field}
                            rows={8}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Generate Code
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card className="min-h-[500px]">
            <CardHeader>
              <CardTitle>Generated Code</CardTitle>
              <CardDescription>
                Your AI-generated code will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex flex-col items-center justify-center space-y-4 pt-10 text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="font-semibold">Generating code...</p>
                  <p className="text-sm text-muted-foreground">
                    Our AI is writing your code snippet.
                  </p>
                </div>
              )}
              {!isLoading && !generatedCode && (
                <div className="flex flex-col items-center justify-center space-y-4 pt-10 text-center">
                  <Wand2 className="h-12 w-12 text-muted-foreground" />
                  <p className="font-semibold">Ready to generate</p>
                  <p className="text-sm text-muted-foreground">
                    Fill out the form to generate your code.
                  </p>
                </div>
              )}
              {generatedCode && <CodeBlock code={generatedCode.code} />}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
