import React, { useState, useEffect, useCallback } from 'react';
import { CandidateApplication } from '../types';
import { fetchApplicationsFromFirestore } from '../lib/firebase';
import {
  Database,
  ExternalLink,
  RefreshCw,
  Send,
  Layers,
  Cloud,
  X,
  Clock,
  Shield,
} from 'lucide-react';

interface StaffSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REFRESH_MS = 10000;

export const StaffSyncModal: React.FC<StaffSyncModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'api' | 'sync'>('queue');
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useState<'firestore' | 'rest' | 'none'>('none');

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      setApplications(await fetchApplicationsFromFirestore());
      setChannel('firestore');
    } catch (e) {
      console.warn('Firestore read failed, trying local REST API:', e);
      try {
        const res = await fetch('/api/applications');
        const data = await res.json();
        if (data.success) {
          setApplications(data.applications);
          setChannel('rest');
        } else {
          setChannel('none');
        }
      } catch (restErr) {
        console.warn('Failed to fetch applications:', restErr);
        setChannel('none');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    fetchApplications();
    const timer = setInterval(fetchApplications, REFRESH_MS);
    return () => clearInterval(timer);
  }, [isOpen, fetchApplications]);

  if (!isOpen) return null;

  const pendingCount = applications.filter((a) => a.status === 'pending').length;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Bruno_Ace_SC',sans-serif] uppercase tracking-wider flex items-center gap-2">
                Шлюз Синхронизации Заявок
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {channel === 'firestore' ? 'FIRESTORE LIVE' : channel === 'rest' ? 'REST FALLBACK' : 'НЕТ СВЯЗИ'}
                </span>
              </h2>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Заявки уходят в общую базу Firestore и обрабатываются в закрытом портале персонала (ac)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-white/15 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 px-6 bg-black/40 gap-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('queue')}
            className={`py-3.5 px-3 border-b-2 font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'queue'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Очередь заявок ({applications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`py-3.5 px-3 border-b-2 font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'api'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Эндпоинты API & Firebase</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`py-3.5 px-3 border-b-2 font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'sync'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Как передаются заявки</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs">
          {activeTab === 'queue' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-zinc-400 text-[11px]">
                  Ожидают решения: <b className="text-cyan-300">{pendingCount}</b> · статус обновляет Владелец в портале персонала
                </span>
                <button
                  onClick={fetchApplications}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>Обновить</span>
                </button>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>
                    {channel === 'none'
                      ? 'Нет связи с базой данных заявок.'
                      : 'Очередь пуста. Заполните анкету на сайте, чтобы протестировать передачу данных.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-xl bg-black/60 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{app.nick}</span>
                          <span className="text-cyan-400 text-[11px]">CID: {app.cid}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              app.status === 'approved'
                                ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300'
                                : app.status === 'rejected'
                                ? 'bg-rose-950/60 border border-rose-500/50 text-rose-300'
                                : 'bg-cyan-950/60 border border-cyan-500/50 text-cyan-300'
                            }`}
                          >
                            {app.status === 'approved'
                              ? 'Одобрено'
                              : app.status === 'rejected'
                              ? 'Отклонено'
                              : 'В обработке'}
                          </span>
                        </div>

                        <div className="text-zinc-400 text-[11px] flex flex-wrap items-center gap-3">
                          <span>Телефон: <strong className="text-white">{app.phone}</strong></span>
                          <span>Discord: <strong className="text-cyan-300">{app.discord}</strong></span>
                          <span>ID: {app.id}</span>
                          <span className="text-zinc-500">
                            {new Date(app.submittedAt).toLocaleString('ru-RU')}
                          </span>
                        </div>

                        {app.status === 'rejected' && app.reviewerNotes && (
                          <div className="text-rose-300/80 text-[11px]">
                            Причина отказа: {app.reviewerNotes}
                          </div>
                        )}

                        <div className="pt-1">
                          <a
                            href={app.docs}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-400 hover:text-white text-[11px] underline flex items-center gap-1"
                          >
                            <span>Скриншот документов: {app.docs}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Send className="w-4 h-4 text-cyan-400" />
                  1. POST /api/applications (резервный канал этого сайта)
                </h4>
                <div className="p-4 rounded-xl bg-black border border-white/10 relative">
                  <pre className="text-cyan-300 leading-relaxed overflow-x-auto text-[11px]">
{`POST /api/applications
Content-Type: application/json

{
  "nick": "John_Apathy",
  "cid": "7XYZ",
  "phone": "777-888",
  "discord": "apathy_candidate#1234",
  "docs": "https://imgur.com/example"
}`}
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  2. Firestore (основной канал передачи)
                </h4>
                <p className="text-zinc-400 text-[11px] mb-2 leading-relaxed">
                  Проект Firebase: <code className="text-white">beaming-diode-mt86m</code>, база{' '}
                  <code className="text-white">{`ai-studio-apathyrp-…`}</code>.
                  Анкета пишется в коллекцию <code className="text-cyan-300">applications</code> этим сайтом,
                  портал персонала (ac) слушает её через <code className="text-yellow-300">onSnapshot()</code>.
                </p>
                <div className="p-4 rounded-xl bg-black border border-white/10 relative">
                  <pre className="text-emerald-300 leading-relaxed overflow-x-auto text-[11px]">
{`applications/{id}
{
  "id": "…",              // совпадает с ID документа
  "nick": "John_Apathy",
  "cid": "7XYZ",
  "phone": "777-888",
  "discord": "apathy_candidate#1234",
  "docs": "https://imgur.com/example",
  "status": "pending",    // pending -> approved | rejected (решает Владелец в ac)
  "submittedAt": "2026-10-11T09:40:00.000Z",
  "source": "public_ac2_site",
  "reviewedAt": "",       // заполняется после проверки
  "reviewerNotes": "",    // причина отказа
  "createdProfileId": ""  // ID созданной учетной записи
}`}
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  3. Права доступа
                </h4>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  <code className="text-cyan-300">firestore.rules</code> разрешают неавторизованному
                  посетителю только создание заявки со статусом{' '}
                  <code className="text-white">pending</code> и строго проверенными полями.
                  Изменять статус может только сторона портала персонала, при этом контактные данные
                  заявки заморожены, а окончательное решение нельзя пересмотреть.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-black border border-white/10 space-y-3 text-[11px] leading-relaxed">
                <div className="flex gap-3">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold">
                    1
                  </span>
                  <p className="text-zinc-300">
                    Кандидат заполняет анкету (ник, CID, телефон, Discord, ссылка на документы) и жмёт
                    «Отправить заявку». Данные уходят в коллекцию <code className="text-cyan-300">applications</code>{' '}
                    общей базы Firestore.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold">
                    2
                  </span>
                  <p className="text-zinc-300">
                    В портале персонала (ac) раздел «Отдел Кадров & Штат» → вкладка{' '}
                    <b className="text-white">«Заявки»</b> получает анкету в реальном времени, без перезагрузки.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold">
                    3
                  </span>
                  <p className="text-zinc-300">
                    Владелец вводит PIN-код, выбирает роль и нажимает «Создать учетную запись» — сотрудник
                    появляется в штате и может войти в портал по нику, CID, телефону, Discord и этому PIN.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-rose-950 border border-rose-500/40 text-rose-300 flex items-center justify-center font-bold">
                    4
                  </span>
                  <p className="text-zinc-300">
                    Отклонённая заявка сохраняет причину отказа. Статус возвращается сюда в течение~10 секунд
                    (кнопка «Обновить» в очереди заявок).
                  </p>
                </div>
              </div>
              <p className="text-zinc-500 text-[11px]">
                PIN-код кандидат не указывает: его задаёт Владелец при принятии, поэтому он не попадает
                в публичную форму.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
