import { useState } from 'react';
import { useReadAloud, useSpeechRecognition } from '../../hooks';
import {
  interpretVoiceCommand,
  CommandInterpretation,
  AppView,
} from '../../services/voice/commandRouter';

export interface UseVoiceCompanionProps {
  initialText?: string;
  onNavigate?: (view: AppView) => void;
}

export function useVoiceCompanion({
  initialText = 'Good day. Remember to breathe deeply, relax your shoulders, and drink a glass of warm water. Take each moment at your own peaceful pace today.',
  onNavigate,
}: UseVoiceCompanionProps = {}) {
  const [textToRead, setTextToRead] = useState(initialText);
  const [speed, setSpeed] = useState<number>(0.85);
  const [typedCommand, setTypedCommand] = useState('');
  const [lastInterpretation, setLastInterpretation] =
    useState<CommandInterpretation | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    supported: ttsSupported,
  } = useReadAloud();

  const handleCommandExecution = (commandText: string) => {
    const trimmed = commandText.trim();
    if (!trimmed) return;

    const interpretation = interpretVoiceCommand(trimmed);
    setLastInterpretation(interpretation);
    setLiveAnnouncement(
      `Command received: "${trimmed}". ${interpretation.spokenFeedback}`
    );

    if (onNavigate) {
      onNavigate(interpretation.targetView);
    }
  };

  const {
    isListening,
    transcript,
    error: speechError,
    supported: speechSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    onResult: (finalText) => {
      handleCommandExecution(finalText);
    },
    onError: (err) => {
      setLiveAnnouncement(`Voice input error: ${err}`);
    },
  });

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
      setLiveAnnouncement('Stopped listening.');
    } else {
      stopSpeaking();
      startListening();
      setLiveAnnouncement('Listening... Speak now.');
    }
  };

  const handlePlayReadAloud = () => {
    if (!textToRead.trim()) return;
    if (isSpeaking) {
      stopSpeaking();
      setLiveAnnouncement('Stopped speaking.');
    } else {
      speak(textToRead, { rate: speed });
      setLiveAnnouncement('Started reading aloud.');
    }
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setLiveAnnouncement('Stopped speaking.');
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (isSpeaking) {
      stopSpeaking();
      speak(textToRead, { rate: newSpeed });
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedCommand.trim()) return;
    handleCommandExecution(typedCommand);
    setTypedCommand('');
  };

  const handleClearText = () => {
    handleStopSpeaking();
    setTextToRead('');
  };

  const handleSelectPreset = (preset: { title: string; text: string }) => {
    handleStopSpeaking();
    setTextToRead(preset.text);
    setLiveAnnouncement(`Loaded preset: ${preset.title}`);
  };

  return {
    textToRead,
    setTextToRead,
    speed,
    typedCommand,
    setTypedCommand,
    lastInterpretation,
    liveAnnouncement,
    isSpeaking,
    ttsSupported,
    isListening,
    transcript,
    speechError,
    speechSupported,
    handleCommandExecution,
    handleToggleListening,
    handlePlayReadAloud,
    handleStopSpeaking,
    handleSpeedChange,
    handleTextSubmit,
    handleClearText,
    handleSelectPreset,
  };
}
