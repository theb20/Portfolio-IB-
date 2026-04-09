import { useEffect, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import { apiGet } from "../../lib/api";

type Stats = {
  orders: number;
  customers: number;
  products: number;
  newMessages: number;
};

export default function EcommerceMetrics() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let mounted = true;
    apiGet("/admin/stats")
      .then((res) => {
        if (!mounted) return;
        setStats(res?.data ?? null);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Clients
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {stats ? stats.customers.toLocaleString("fr-FR") : "—"}
            </h4>
          </div>
          {stats && (
            <Badge color={stats.newMessages > 0 ? "warning" : "success"}>
              {stats.newMessages > 0 ? (
                <>
                  <ArrowUpIcon />
                  {stats.newMessages} msg
                </>
              ) : (
                "À jour"
              )}
            </Badge>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Commandes
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {stats ? stats.orders.toLocaleString("fr-FR") : "—"}
            </h4>
          </div>
          {stats && (
            <Badge color={stats.orders > 0 ? "success" : "error"}>
              {stats.orders > 0 ? (
                <>
                  <ArrowUpIcon />
                  {stats.products} produits
                </>
              ) : (
                <>
                  <ArrowDownIcon />
                  Vide
                </>
              )}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
