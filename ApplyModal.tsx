import React, { useState } from 'react';
import { ApplicationFormData, CandidateApplication } from '../types';
import { submitApplicationToFirestore, validateApplication } from '../lib/firebase';
import {
  CheckCircle2,
  Send,
  Loader2,
  AlertCircle,
  Database,
  Check,
  RotateCcw,
  X,
  ExternalLink,
} from 'lucide-react';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplicationCreated?: (app: CandidateApplication) => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  isOpen,
  onClose,
  onApplicationCreated,
}) => {
  const [formData, setFormData] = useState<ApplicationFormData>({
    nick: '',
    cid: '',
    phone: '',
    discord: '',
    docs: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedApp, setSubmittedApp] = useState<CandidateApplication | null>(null);
  const [handedToHr, setHandedToHr] = useState(true);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.nick.trim()) {
      setError('Укажите ник персонажа в игре');
      return;
    }
    if (!formData.cid.trim()) {
      setError('Укажите CID персонажа');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Укажите номер телефона');
      return;
    }
    if (!formData.discord.trim()) {
      setError('Укажите ваш Discord (логин или тег)');
      return;
    }
    if (!formData.docs.trim()) {
      setError('Укажите ссылку на скриншот документов (например Imgur)');
      return;
    }

    const formatError = validateApplication(formData);
    if (formatError) {
      setError(formatError);
      return;
    }

    setLoading(true);

    let created: CandidateApplication | null = null;

    // 1. Primary channel: shared Firestore collection read by the staff portal (ac)
    try {
      created = await submitApplicationToFirestore(formData);
    } catch (fbErr) {
      console.warn('Firestore submit failed, falling back to REST API:', fbErr);
    }

    // 2. Fallback channel: the portal's own express API
    if (!created) {
      try {
        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Ошибка при отправке заявки на сервер');
        }
        created = json.application as CandidateApplication;
        setHandedToHr(false);
      } catch (err: unknown) {
        console.error('Submit application failed on both channels:', err);
        setError(
          'База данных заявок временно недоступна. Заявка НЕ отправлена — повторите попытку позже.'
        );
        setLoading(false);
        return;
      }
    } else {
      setHandedToHr(true);
    }

    setSubmittedApp(created);
    setLoading(false);

    // Save to local storage for user backup
    try {
      const saved = JSON.parse(localStorage.getItem('apathy_my_applications') || '[]');
      saved.unshift(created);
      localStorage.setItem('apathy_my_applications', JSON.stringify(saved));
    } catch {
      // ignore
    }

    if (onApplicationCreated) {
      onApplicationCreated(created);
    }
  };

  const handleReset = () => {
    setFormData({
      nick: '',
      cid: '',
      phone: '',
      discord: '',
      docs: '',
    });
    setSubmittedApp(null);
    setError(null);
    setHandedToHr(true);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#04060a]/90 backdrop-blur-md animate-fadeIn"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-[580px] bg-gradient-to-b from-[#10151e] to-[#090c12] border border-[#738299]/35 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(90,103,123,0.18)] overflow-hidden">
        {/* Glowing top line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#738299] to-transparent" />

        {/* Header */}
        <div className="flex items-start justify-between px-6 sm:px-8 pt-7 pb-5 border-b border-white/5">
          <div>
            <div className="text-[10px] tracking-[0.25em] text-[#89949f] uppercase mb-1 font-['Bruno_Ace_SC',sans-serif]">
              RECRUITMENT // СИСТЕМА ЗАЯВОК
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-[0.15em] text-white uppercase font-['Bruno_Ace_SC',sans-serif]">
              {submittedApp ? 'ЗАЯВКА ПРИНЯТА' : 'ПОДАЧА ЗАЯВКИ'}
            </h2>
          </div>

          <button
            onClick={onClose}
            type="button"
            aria-label="Закрыть"
            className="w-9 h-9 rounded-full border border-[#738299]/30 hover:border-white text-[#738299] hover:text-white flex items-center justify-center transition-all duration-300 hover:rotate-90 hover:bg-white/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 sm:mx-8 mt-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 flex items-center gap-2 text-rose-300 text-xs font-mono">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form View */}
        {!submittedApp ? (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 flex flex-col gap-4 font-mono">
            {/* 01. Nick */}
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="nick" className="form-label text-[11px]">
                <span className="text-[#738299]">01.</span> НИК В ИГРЕ
              </label>
              <input
                id="nick"
                name="nick"
                type="text"
                value={formData.nick}
                onChange={handleChange}
                placeholder="Например: John_Apathy"
                required
                className="form-input text-sm field-glow"
              />
            </div>

            {/* 02. CID */}
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="cid" className="form-label text-[11px]">
                <span className="text-[#738299]">02.</span> CID ПЕРСОНАЖА
              </label>
              <input
                id="cid"
                name="cid"
                type="text"
                value={formData.cid}
                onChange={handleChange}
                placeholder="Например: 7XYZ"
                required
                className="form-input text-sm field-glow"
              />
            </div>

            {/* 03. Phone */}
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="phone" className="form-label text-[11px]">
                <span className="text-[#738299]">03.</span> НОМЕР ТЕЛЕФОНА
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Например: 777-888"
                required
                className="form-input text-sm field-glow"
              />
            </div>

            {/* 04. Discord (THE REQUESTED FIELD) */}
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="discord" className="form-label text-[11px] text-cyan-400">
                <span className="text-cyan-400 font-bold">04.</span> DISCORD
                <span className="text-[10px] text-cyan-400/70 normal-case ml-1 tracking-normal font-sans">
                  (для связи с HR-отделом)
                </span>
              </label>
              <input
                id="discord"
                name="discord"
                type="text"
                value={formData.discord}
                onChange={handleChange}
                placeholder="Например: apathy_operative#0000 или username"
                required
                className="form-input text-sm border-cyan-500/40 bg-[#0d1420]/80 text-white field-glow"
              />
            </div>

            {/* 05. Docs link */}
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="docs" className="form-label text-[11px]">
                <span className="text-[#738299]">05.</span> СКРИН ДОКУМЕНТОВ (ССЫЛКА)
              </label>
              <input
                id="docs"
                name="docs"
                type="url"
                value={formData.docs}
                onChange={handleChange}
                placeholder="https://imgur.com/..."
                required
                className="form-input text-sm field-glow"
              />
            </div>

            {/* Submit Action */}
            <div className="mt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-submit-apply flex items-center justify-center gap-2 py-3.5 rounded-full cursor-pointer transition-all duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                    <span>ОТПРАВКА В БАЗУ ДАННЫХ...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-cyan-400" />
                    <span>ОТПРАВИТЬ ЗАЯВКУ</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Success state - Note that Discord buttons are completely removed! */
          <div className="p-6 sm:p-8 flex flex-col items-center text-center animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-cyan-950/60 border border-cyan-400/50 flex items-center justify-center mb-4 text-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.3)]">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div
              className={`inline-block px-3.5 py-1 rounded-full border text-[10px] tracking-widest font-mono uppercase mb-2 ${
                handedToHr
                  ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                  : 'border-amber-500/40 bg-amber-950/30 text-amber-300'
              }`}
            >
              {handedToHr
                ? 'База данных APATHY · ЗАЯВКА ПЕРЕДАНА В ОТДЕЛ КАДРОВ'
                : 'ВНИМАНИЕ · ЗАЯВКА СОХРАНЕНА БЕЗ ОБЩЕЙ БАЗЫ, HR ЕЁ НЕ УВИДИТ'}
            </div>

            <h3 className="text-lg font-bold text-white uppercase tracking-wider font-['Bruno_Ace_SC',sans-serif] mb-2">
              АНКЕТА ПЕРЕДАНА РУКОВОДСТВУ
            </h3>

            <p className="text-xs text-[#89949f] leading-relaxed max-w-md mb-5 font-mono">
              Ваша заявка успешно отправлена на сервер корпорации APATHY и занесена в базу данных.
              Сотрудник HR-отдела проверит документы и свяжется с вами через Discord.
            </p>

            {/* Application Summary Box */}
            <div className="w-full rounded-xl bg-black/60 border border-white/10 p-4 text-left font-mono text-xs space-y-2 mb-6">
              <div className="flex justify-between items-center pb-2 border-b border-white/10 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Database className="w-3.5 h-3.5" />
                  ID заявки: <strong className="text-white">{submittedApp.id}</strong>
                </span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />В обработке
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-2 pt-1 text-[11px]">
                <div>
                  <span className="text-zinc-500">Ник: </span>
                  <span className="text-white font-medium">{submittedApp.nick}</span>
                </div>
                <div>
                  <span className="text-zinc-500">CID: </span>
                  <span className="text-white font-medium">{submittedApp.cid}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Телефон: </span>
                  <span className="text-white font-medium">{submittedApp.phone}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Discord: </span>
                  <span className="text-cyan-300 font-medium">{submittedApp.discord}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-zinc-500 truncate max-w-[240px]">
                  Документы: {submittedApp.docs}
                </span>
                <a
                  href={submittedApp.docs}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-white flex items-center gap-1 text-[10px] underline ml-2 shrink-0"
                >
                  <span>Проверить</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Action buttons (Notice: Copy to Discord & Join Discord buttons are removed) */}
            <div className="w-full flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-3 px-4 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-cyan-400/50 text-white text-xs font-['Bruno_Ace_SC',sans-serif] tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Заполнить ещё одну</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-full border border-cyan-500/50 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-200 text-xs font-['Bruno_Ace_SC',sans-serif] tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.15)]"
              >
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>Готово</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
