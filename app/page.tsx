'use client';

import React, { useState, useEffect } from 'react';
// @ts-ignore
import { Story } from 'inkjs';

export default function Home() {
  const [story, setStory] = useState<any>(null);
  const [currentText, setCurrentText] = useState<string[]>([]);
  const [currentChoices, setCurrentChoices] = useState<any[]>([]);
  const [currentScene, setCurrentScene] = useState<string>('01_私人后花园.jpg');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    fetch('/story.json')
      .then((res) => {
        if (!res.ok) throw new Error('找不到 story.json 文件');
        return res.json();
      })
      .then((data) => {
        try {
          const loadedStory = new Story(data);
          setStory(loadedStory);
          advanceStory(loadedStory);
        } catch (e: any) {
          setErrorMsg('Ink 解析错误: ' + e.message);
        }
      })
      .catch((err) => {
        setErrorMsg('读取文件失败: ' + err.message);
      });
  }, []);

  const advanceStory = (activeStory: any) => {
    let paragraphs: string[] = [];

    // 循环读取文本，直到没有内容或者遇到选项
    while (activeStory.canContinue) {
      const line = activeStory.Continue();
      if (line && line.trim() !== '') {
        paragraphs.push(line);
      }

      const tags = activeStory.currentTags;
      if (tags && tags.length > 0) {
        tags.forEach((tag: string) => {
          if (tag.startsWith('SCENE:')) {
            setCurrentScene(tag.replace('SCENE:', '').trim());
          }
        });
      }
    }

    setCurrentText(paragraphs);
    setCurrentChoices(activeStory.currentChoices || []);
  };

  const handleChoiceSelect = (choiceIndex: number) => {
    if (!story) return;
    story.ChooseChoiceIndex(choiceIndex);
    advanceStory(story);
  };

  return (
    <main 
      className="relative w-screen h-screen bg-cover bg-center flex flex-col justify-between p-8 text-amber-50"
      style={{ 
        backgroundColor: '#141210',
        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('/images/design/${currentScene}')` 
      }}
    >
      {/* 顶部标题 */}
      <div className="text-sm font-serif tracking-widest text-amber-200/70 uppercase">
        ROORIVA · 镜园纪事 (Demo v0.1)
      </div>

      {/* 中部：剧情文本展示框 */}
      <div className="max-w-2xl mx-auto w-full bg-black/60 backdrop-blur-md p-8 rounded-xl border border-amber-900/40 shadow-2xl space-y-4 my-auto">
        {errorMsg ? (
          <p className="text-red-400 font-serif text-center">{errorMsg}</p>
        ) : currentText.length > 0 ? (
          currentText.map((paragraph, index) => (
            <p key={index} className="font-serif text-lg leading-relaxed tracking-wide text-amber-100/90">
              {paragraph}
            </p>
          ))
        ) : (
          <p className="text-amber-200/50 font-serif text-center">正在加载剧本内容，或当前节点无文本...</p>
        )}
      </div>

      {/* 底部：可点击的选项区域 */}
      <div className="max-w-xl mx-auto w-full space-y-3 pb-6">
        {currentChoices.map((choice: any, index: number) => (
          <button
            key={index}
            onClick={() => handleChoiceSelect(index)}
            className="w-full text-left p-4 bg-black/70 hover:bg-amber-950/80 border border-amber-800/60 hover:border-amber-500 rounded-lg text-amber-100 font-serif tracking-wide transition-all shadow-md"
          >
            {choice.text}
          </button>
        ))}
      </div>
    </main>
  );
}