import React from "react";
import JSXParser from "react-jsx-parser";
import * as CustomComponents from '../UI/Card';
import { Lightbulb } from 'lucide-react';

const styles = {
  container: "-mt-5",
  card: "max-w-4xl mx-auto border-none p-4",
  title: "text-2xl text-emerald-400",
  link: "text-emerald-400 hover:text-emerald-300 transition-colors",
  content: "space-y-6",
  step: "space-y-3",
  stepTitle: "text-lg font-semibold text-emerald-400",
  text: "text-slate-300",
  tip: "flex items-start gap-2 bg-slate-900/50 p-3 rounded-md text-slate-400",
  tipIcon: "h-5 w-5 mt-1 text-amber-400",
  code: "text-emerald-300",
  pre: "bg-slate-900 p-3 rounded-md font-mono text-emerald-300",
};

const RenderQuestion = ({ questionString }) => {
  return (
    <div className={styles.container}>
      <JSXParser
        bindings={{ styles }}
        jsx={questionString}
        components={{ ...CustomComponents, Lightbulb }}
        renderInWrapper={false}
        showWarnings={true}
      />
    </div>
  );
};

export default RenderQuestion;

