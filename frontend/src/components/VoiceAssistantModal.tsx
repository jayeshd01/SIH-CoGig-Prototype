import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMic, FiX, FiCheckCircle, FiVolume2 } from 'react-icons/fi';

interface VoiceAssistantModalProps {
  onClose: () => void;
}

const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [assistantReply, setAssistantReply] = useState(
    'नमस्ते! आप अपनी आवश्यकता बोलकर बता सकते हैं (उदा. "मुझे तुरंत इलेक्ट्रीशियन चाहिए" या "नल से पानी टपक रहा है")'
  );
  const [matchedCategory, setMatchedCategory] = useState<string | null>(null);

  const samplePrompts = [
    { text: 'बिजली का स्विचबोर्ड खराब हो गया है (Electrician)', cat: 'electrician' },
    { text: 'नल में लीकेज है, प्लंबर भेजो (Plumber)', cat: 'plumber' },
    { text: 'घर की डीप क्लीनिंग करवानी है (Cleaning)', cat: 'cleaning' },
    { text: 'एसी की सर्विसिंग करवानी है (Appliance)', cat: 'appliance' },
  ];

  const handleSimulateVoice = (promptText: string, cat: string) => {
    setIsListening(true);
    setSpokenText('');
    setMatchedCategory(null);

    setTimeout(() => {
      setIsListening(false);
      setSpokenText(promptText);
      setMatchedCategory(cat);

      const reply = `मैंने आपकी आवश्यकता समझ ली है: ${cat.toUpperCase()} सेवा। क्या मैं आपके लिए नजदीकी सत्यापित सहकारी कारीगर खोजूं?`;
      setAssistantReply(reply);

      // Browser speech synthesis if supported
      if ('speechSynthesis' in window) {
        try {
          const utterance = new SpeechSynthesisUtterance('सहयोग सहकारी सेवा में आपका स्वागत है। कारीगर खोजे जा रहे हैं।');
          utterance.lang = 'hi-IN';
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          // ignore
        }
      }
    }, 1200);
  };

  const handleProceed = () => {
    onClose();
    if (matchedCategory) {
      navigate(`/services?cat=${matchedCategory}`);
    } else {
      navigate('/services');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-emerald-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1B6B3A] to-[#2A8F4F] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <FiVolume2 className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">सहयोग वाणी (Vernacular Voice Assistant)</h3>
              <p className="text-xs text-emerald-100">Accessible Multi-Language Voice Booking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-center">
          {/* Animated Microphone button */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <button
              onClick={() => handleSimulateVoice('नल में लीकेज है, तुरंत प्लंबर भेजो', 'plumber')}
              className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white animate-ping ring-8 ring-red-200'
                  : 'bg-gradient-to-br from-[#1B6B3A] to-[#2A8F4F] text-white hover:scale-105 active:scale-95 ring-4 ring-emerald-100'
              }`}
            >
              <FiMic />
            </button>
            <span className="text-xs font-bold text-gray-500">
              {isListening ? 'सुन रहे हैं... (Listening)' : 'माइक दबाएं और बोलें (Tap & Speak)'}
            </span>
          </div>

          {/* Spoken Text Display */}
          {spokenText && (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 text-left">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">You said:</span>
              &ldquo;{spokenText}&rdquo;
            </div>
          )}

          {/* Assistant Voice Reply */}
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 text-left flex items-start gap-2.5">
            <FiCheckCircle className="text-emerald-700 w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-emerald-800">सहयोग सहायक:</span>
              <p className="mt-0.5 text-gray-700 leading-relaxed">{assistantReply}</p>
            </div>
          </div>

          {/* Quick Voice Simulation Buttons */}
          <div className="space-y-1.5 text-left">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Try Sample Voice Queries:
            </span>
            <div className="space-y-1">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSimulateVoice(p.text, p.cat)}
                  className="w-full text-left text-xs p-2 rounded-lg border border-gray-100 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 transition-colors text-gray-700 font-medium"
                >
                  🗣️ &ldquo;{p.text}&rdquo;
                </button>
              ))}
            </div>
          </div>

          {/* Action button if matched */}
          {matchedCategory && (
            <button
              onClick={handleProceed}
              className="w-full py-3 bg-[#1B6B3A] text-white font-bold rounded-xl shadow-md hover:bg-[#145A2F] transition-colors text-xs flex items-center justify-center gap-2"
            >
              आगे बढ़ें: {matchedCategory.toUpperCase()} सेवाएं देखें &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistantModal;
