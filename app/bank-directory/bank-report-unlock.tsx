'use client';
import { FormEvent, useEffect, useState } from 'react';
import { RxCross2 } from "react-icons/rx";
import CheckoutNotice from '../shared/checkout-notice';

export type UnlockMode = 'pay' | 'membership' | 'all';

export default function BankReportUnlock({
  bankId,
  bankName,
  onClose,
  initialMode = 'all',
}: {
  bankId: string;
  bankName: string;
  onClose: () => void;
  initialMode?: UnlockMode;
}) {
  const [activeMode, setActiveMode] = useState<UnlockMode>(initialMode);
  const [message, setMessage] = useState('');
  const [working, setWorking] = useState(false);

  useEffect(() => {
    setActiveMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    fetch('/api/bank-premium-login')
      .then((r) => r.json())
      .then((result) => {
        if (result.authenticated)
          window.location.href = `/bank-directory/full-report?bankId=${encodeURIComponent(bankId)}`;
      })
      .catch(() => {});
  }, [bankId]);

  async function useCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true);
    setMessage('');
    const code = String(new FormData(event.currentTarget).get('code') || '');
    const response = await fetch('/api/bank-report-access', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ bankId, code }),
    });
    const result = (await response.json()) as {
      error?: string;
      reportUrl?: string;
    };
    if (!response.ok || !result.reportUrl) {
      setMessage(result.error || 'The code could not be accepted.');
      setWorking(false);
      return;
    }
    window.location.href = result.reportUrl;
  }

  async function premiumLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true);
    setMessage('');
    const data = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    );
    const response = await fetch('/api/bank-premium-login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...data, bankId }),
      }),
      result = (await response.json()) as any;
    if (!response.ok || !result.reportUrl) {
      setMessage(result.error || 'Premium login was not accepted.');
      setWorking(false);
      return;
    }
    window.location.href = result.reportUrl;
  }

  return (
    <div
      className="fixed z-[210] inset-0 bg-[#071521c9] grid place-items-center p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Unlock full report for ${bankName}`}
      onClick={onClose}
    >
      <section
        className="reportUnlockModal relative w-full max-w-[1000px] max-h-[94vh] overflow-y-auto bg-white rounded-[10px] p-5 sm:p-[35px] shadow-[0_30px_90px_#0009]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="absolute right-[17px] top-[10px] rounded-full p-1 bg-red-200 text-[#263848] hover:text-black text-[34px] leading-none cursor-pointer select-none transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          <RxCross2 className='text-2xl'/>
        </button>

        <div className="text-center max-w-[880px] mx-auto">
          <p className="text-[15px] tracking-[0.10em] font-bold text-[#a67c2c] uppercase mb-2">
            PROTECTED RESEARCH
          </p>
          <h2 className="text-2xl sm:text-[36px] font-bold text-[#102a43] my-2 leading-tight">
            {bankName}
          </h2>
          <p className="text-[#637282] text-sm sm:text-base leading-[1.6] m-0">
            {activeMode === 'pay'
              ? 'Complete checkout to purchase and unlock this full research report.'
              : activeMode === 'membership'
              ? 'Sign in with your premium account or enter a valid access code.'
              : 'Choose one of three ways to view the complete report.'}
          </p>
        </div>

        {/* 1. PREMIUM MEMBER */}
        {(activeMode === 'membership' || activeMode === 'all') && (
          <form
            className="max-w-[720px] mx-auto my-6 p-[22px] border border-[#d8c58f] bg-[#fbf8ef] grid grid-cols-1 min-[850px]:grid-cols-2 gap-[14px] text-left"
            onSubmit={premiumLogin}
          >
            <div className="col-span-full">
              <p className="text-[13px] tracking-[0.10em] font-bold text-[#a67c2c] uppercase m-0">
                PREMIUM MEMBER
              </p>
              <h3 className="my-[3px] text-[#102a43] text-xl sm:text-[25px] font-bold leading-snug">
                Access every bank report
              </h3>
              <p className="my-[5px] text-[#637282] text-xs sm:text-sm leading-[1.5]">
                Want access to all our detailed research? Please{' '}
                <a href="/contact" className="text-[#8a6724] font-bold hover:underline">
                  reach out to Kav Haribis
                </a>{' '}
                and ask about becoming a premium member.
              </p>
            </div>
            <label className="text-[12px] font-bold text-[#102a43] flex flex-col">
              Email address
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full mt-1.5 p-3 border border-[#ccd6dc] bg-white text-sm text-[#102a43] rounded-none outline-none focus:border-[#a67c2c] transition-colors"
              />
            </label>
            <label className="text-[12px] font-bold text-[#102a43] flex flex-col">
              Password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full mt-1.5 p-3 border border-[#ccd6dc] bg-white text-sm text-[#102a43] rounded-none outline-none focus:border-[#a67c2c] transition-colors"
              />
            </label>
            <button
              className="col-span-full inline-flex justify-center items-center py-[15px] px-[23px] rounded-[5px] border-0 font-bold cursor-pointer bg-[#c69b46] hover:bg-[#b0883b] text-white text-sm sm:text-base transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={working}
            >
              {working ? 'Checking…' : 'Premium member login →'}
            </button>
          </form>
        )}

        {/* 2. USE A REPORT CODE */}
        {(activeMode === 'membership' || activeMode === 'all') && (
          <>
            <div className="w-[520px] mx-auto flex items-center gap-3 text-[#937029] text-[10px] font-bold tracking-[0.12em] uppercase my-5 before:content-[''] before:h-px before:bg-[#e1e4e5] before:flex-1 after:content-[''] after:h-px after:bg-[#e1e4e5] after:flex-1">
              <span>OR USE A REPORT CODE</span>
            </div>
            <form className="max-w-[720px] mx-auto my-5 text-left" onSubmit={useCode}>
              <label className="text-[12px] font-bold text-[#102a43] block">
                Have an access code?
                <div className="flex mt-2">
                  <input
                    name="code"
                    required
                    autoCapitalize="characters"
                    placeholder="Enter access code"
                    className="flex-1 p-[13px] border border-[#ccd6dc] uppercase text-sm outline-none focus:border-[#102a43] transition-colors"
                  />
                  <button
                    disabled={working}
                    className="border-0 bg-[#102a43] hover:bg-[#173f5f] text-white px-5 py-3 font-bold text-sm cursor-pointer transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {working ? 'Checking…' : 'Use code'}
                  </button>
                </div>
              </label>
              {message && (
                <p className="text-[#a52d2d] bg-[#fff0f0] p-2.5 rounded-[4px] text-xs sm:text-sm mt-3 font-medium">
                  {message}
                </p>
              )}
            </form>
          </>
        )}

        {/* 3. PAY $15 FOR THIS REPORT */}
        {(activeMode === 'pay' || activeMode === 'all') && (
          <>
            <div className="hidden items-center gap-3 text-[#937029] text-[10px] font-bold tracking-[0.12em] uppercase my-5 before:content-[''] before:h-px before:bg-[#e1e4e5] before:flex-1 after:content-[''] after:h-px after:bg-[#e1e4e5] after:flex-1">
              <span>
                {activeMode === 'all'
                  ? 'OR PAY $15 FOR THIS REPORT'
                  : 'PAY $15 FOR THIS REPORT'}
              </span>
            </div>
            <CheckoutNotice kind="bank-report" amount="$15.00" bankId={bankId} />
          </>
        )}

        {/* Quick Mode Switcher Links */}
        {activeMode === 'pay' && (
          <div className="mt-6 text-center text-[15px] text-[#64748b] pt-4">
            <span>Already a premium member or have an access code? </span>
            <button
              type="button"
              className="text-[#c69b46] hover:text-[#b0883b] font-bold bg-transparent border-0 cursor-pointer p-0 underline ml-1 transition-colors"
              onClick={() => {
                setMessage('');
                setActiveMode('membership');
              }}
            >
              Sign in or enter code →
            </button>
          </div>
        )}

        {activeMode === 'membership' && (
          <div className="mt-6 text-center text-[15px] text-[#64748b] pt-4">
            <span>Want to purchase this single report instead? </span>
            <button
              type="button"
              className="text-[#c69b46] hover:text-[#b0883b] font-bold bg-transparent border-0 cursor-pointer p-0 underline ml-1 transition-colors"
              onClick={() => {
                setMessage('');
                setActiveMode('pay');
              }}
            >
              Unlock full report for $15 →
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
