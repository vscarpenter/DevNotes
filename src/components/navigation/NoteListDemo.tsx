/**
 * Demo component to showcase the NoteList functionality
 * This is for testing purposes only
 */

import React from 'react';
import { NoteListContainer } from './NoteListContainer';

export const NoteListDemo: React.FC = () => {
  return (
    <div className="h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">DevNotes - Note List Demo</h1>
      <div className="border border-border rounded-lg h-96">
        <NoteListContainer height={384} />
      </div>
    </div>
  );
};