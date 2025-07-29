
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuizState } from "@/hooks/use-quiz-state";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SendEmailsPage() {
  const { users } = useQuizState();
  const { toast } = useToast();
  const [subject, setSubject] = useState("Your Quiz Link is Ready!");
  const [body, setBody] = useState(
    "Hi {userName},\n\nYour personalized link for the quiz is ready. Please click the link below to start your quiz.\n\n{quizUrl}\n\nGood luck!"
  );
  const [formSubmitEmail, setFormSubmitEmail] = useState("");

  const handleSendEmails = async () => {
    if (!formSubmitEmail) {
      toast({
        title: "Error",
        description: "Please enter your FormSubmit email address.",
        variant: "destructive",
      });
      return;
    }

    if (users.length === 0) {
      toast({
        title: "No Users",
        description: "There are no users to send emails to.",
        variant: "destructive",
      });
      return;
    }

    // This is a client-side simulation.
    // In a real scenario, you'd want a backend to loop and send.
    // FormSubmit's free plan is designed for one submission at a time from a browser.
    // To send to all users, you would need to submit the form for each user.
    // This example will just open a pre-filled email for the *first* user as a demonstration.
    
    toast({
        title: "Preparing Emails...",
        description: `This is a demonstration. In a real application, you would need a backend service to loop through users and send individual emails.`,
    });
    
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `https://formsubmit.co/${formSubmitEmail}`;
    form.target = '_blank'; // Open in new tab to not navigate away

    const user = users[0]; // Demo with the first user
    const personalizedBody = body
      .replace('{userName}', user.name)
      .replace('{quizUrl}', window.location.origin + user.quizUrl);

    const inputs = {
        _subject: subject,
        email: user.id, // Assuming user ID is their email
        message: personalizedBody,
        _next: `${window.location.origin}/admin/send-emails`, // Redirect back
    };

    for (const name in inputs) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = (inputs as any)[name];
        form.appendChild(input);
    }
    
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Send Quiz Invitations
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-6 w-6" /> Compose Email
          </CardTitle>
          <CardDescription>
            Craft the invitation email that will be sent to all registered users.
            Use {'{userName}'} and {'{quizUrl}'} as placeholders.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="formsubmit-email">Your FormSubmit Email</Label>
            <Input
              id="formsubmit-email"
              placeholder="your-email@example.com"
              value={formSubmitEmail}
              onChange={(e) => setFormSubmitEmail(e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground">The email address you registered with FormSubmit.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Email Body</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
            />
          </div>
          
          <form action={`https://formsubmit.co/${formSubmitEmail}`} method="POST" target="_blank">
             {/* These are the fields that will be submitted for each user */}
            <input type="hidden" name="_subject" defaultValue={subject} />
             {/* This is a template. The actual values will be looped through */}
            <input type="email" name="email" defaultValue={users[0]?.id || ""} style={{display: "none"}} readOnly/>
            <textarea name="message" defaultValue={body.replace('{userName}', users[0]?.name).replace('{quizUrl}', users[0] ? window.location.origin + users[0].quizUrl : '')} style={{display: "none"}} readOnly></textarea>
            
            <input type="hidden" name="_next" defaultValue={`${typeof window !== 'undefined' ? window.location.origin : ''}/admin/send-emails`} />
            <input type="hidden" name="_captcha" defaultValue="false" />


            <Button 
                onClick={handleSendEmails} 
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90" 
                disabled={users.length === 0 || !formSubmitEmail}
                type="button"
            >
              <Send className="mr-2 h-4 w-4" />
              Send
            </Button>
          </form>

          {users.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Please upload users before sending emails.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
