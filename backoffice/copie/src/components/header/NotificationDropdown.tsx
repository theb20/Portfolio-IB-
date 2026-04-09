import { useEffect, useRef, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useNavigate } from "react-router";
import { connectWS } from "../../lib/ws";

type Notif = {
  id: string;
  type: "order" | "message";
  title: string;
  body: string;
  time: Date;
  read: boolean;
};

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const counterRef = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    const { on, close } = connectWS();

    const offOrder = on("orders.new", (data: unknown) => {
      const order = data as { id?: string; customer?: { name?: string; email?: string } };
      const id = String(counterRef.current++);
      setNotifs((prev) => [
        {
          id,
          type: "order",
          title: "Nouvelle commande",
          body: order.customer?.name
            ? `${order.customer.name} vient de passer une commande.`
            : "Une nouvelle commande a été passée.",
          time: new Date(),
          read: false,
        },
        ...prev.slice(0, 19),
      ]);
    });

    const offMsg = on("messages.new", (data: unknown) => {
      const msg = data as { name?: string; project?: string };
      const id = String(counterRef.current++);
      setNotifs((prev) => [
        {
          id,
          type: "message",
          title: "Nouveau message",
          body: msg.name
            ? `${msg.name} vous a envoyé un message${msg.project ? ` — ${msg.project}` : ""}.`
            : "Un nouveau message de contact vient d'arriver.",
          time: new Date(),
          read: false,
        },
        ...prev.slice(0, 19),
      ]);
    });

    return () => { offOrder(); offMsg(); close(); };
  }, []);

  const unread = notifs.filter((n) => !n.read).length;

  function open() {
    setIsOpen(true);
    // Marquer comme lus à l'ouverture
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function close() { setIsOpen(false); }

  function goTo(notif: Notif) {
    close();
    if (notif.type === "order") navigate("/orders");
    else navigate("/messages");
  }

  return (
    <div className="relative">
      <button
        onClick={isOpen ? close : open}
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      >
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white leading-none">
            {unread > 9 ? "9+" : unread}
            <span className="absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60 animate-ping" />
          </span>
        )}
        <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20">
          <path fillRule="evenodd" clipRule="evenodd" d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z" fill="currentColor" />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={close}
        className="absolute -right-[240px] mt-[17px] flex h-[440px] w-[340px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[360px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-base font-semibold text-gray-800 dark:text-white/90">Notifications</h5>
          {notifs.length > 0 && (
            <button
              type="button"
              onClick={() => setNotifs([])}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              Tout effacer
            </button>
          )}
        </div>

        <ul className="flex flex-col overflow-y-auto flex-1 gap-0.5">
          {notifs.length === 0 ? (
            <li className="flex flex-col items-center justify-center h-full text-center py-10">
              <svg className="mb-3 text-gray-300 dark:text-gray-700" width="36" height="36" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z" />
              </svg>
              <p className="text-sm text-gray-400">Aucune notification</p>
              <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Les nouvelles commandes et messages apparaîtront ici</p>
            </li>
          ) : (
            notifs.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => goTo(n)}
                  className="w-full text-left flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <span className={`flex-shrink-0 mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-sm ${n.type === "order" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"}`}>
                    {n.type === "order" ? "🛒" : "✉️"}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-gray-800 dark:text-white/90">{n.title}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{n.body}</span>
                    <span className="block text-[11px] text-gray-400 mt-1">{timeAgo(n.time)}</span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </Dropdown>
    </div>
  );
}
