'use client';
import { FormEvent, useState } from 'react';

export default function PersonalizedHeterForm() {
  const [discount, setDiscount] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [reference, setReference] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = event.currentTarget,
      data = new FormData(form);
    try {
      const response = await fetch('/api/contact-submissions', {
          method: 'POST',
          body: data,
        }),
        result = (await response.json()) as {
          reference?: string;
          error?: string;
        };
      if (!response.ok)
        throw new Error(result.error || 'Your request could not be submitted.');
      setReference(result.reference || '');
      form.reset();
      setDiscount(false);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Your request could not be submitted.',
      );
    } finally {
      setBusy(false);
    }
  }
  if (reference)
    return (
      <div className="p-[27px_18px] min-[651px]:p-[38px] border border-[#e0e5e7] border-t-4 border-t-[#c69b46] rounded-[10px] bg-white shadow-[0_25px_70px_#17364c1c] text-center">
        <span className="grid place-items-center w-[64px] h-[64px] mx-auto rounded-full bg-[#e8f5eb] text-[#397747] text-[30px]">✓</span>
        <p className="text-[15px] tracking-[0.10em] font-bold text-[#a67c2c] mb-5 capitalize mt-4">REQUEST RECEIVED</p>
        <h2 className="my-[8px] text-[#102a43] font-serif font-medium text-[35px] leading-[1.15]">Thank you</h2>
        <p className="text-[#637282] leading-[1.6]">Your request was saved in the private Kav Haribis administrator.</p>
        <small className="text-[#9a752d] text-[9px] font-extrabold tracking-[0.15em] block mt-4 uppercase">REFERENCE NUMBER</small>
        <strong className="block my-[12px] text-[#9a752d] font-mono text-[27px] font-bold">{reference}</strong>
        <p className="text-[#637282] leading-[1.6]">We will contact you using the information provided.</p>
        <button className="border-0 bg-transparent text-[#8a6724] underline cursor-pointer mt-4 hover:text-[#6e501a]" onClick={() => setReference('')}>Submit another request</button>
      </div>
    );
  return (
    <form className="p-[27px_18px] min-[651px]:p-[38px] border border-[#e0e5e7] border-t-4 border-t-[#c69b46] rounded-[10px] bg-white shadow-[0_25px_70px_#17364c1c]" onSubmit={submit}>
      <div className="mb-4">
        <small className="text-[#9a752d] text-[9px] font-extrabold tracking-[0.15em] uppercase">SECURE REQUEST FORM</small>
        <h2 className="my-[8px] text-[#102a43] font-serif font-medium text-[29px] min-[651px]:text-[35px] leading-[1.15]">Tell us about your lending structure</h2>
        <p className="text-[#637282] leading-[1.6]">
          Please provide enough information for an initial review. Do not
          include account numbers, passwords, or card information.
        </p>
      </div>
      <input
        type="hidden"
        name="topic"
        value="Personalized Heter Iska Request"
      />
      <input
        type="hidden"
        name="request_subtype"
        value={
          discount ? '$120 nonprofit discount requested' : '$250 standard price'
        }
      />
      <div className="grid grid-cols-1 min-[651px]:grid-cols-2 gap-[16px]">
        <label className="block my-[16px] text-[#344c5e] text-[12px] font-extrabold">
          Full name
          <input className="block w-full mt-[8px] p-[13px_14px] border border-[#ccd6dc] rounded-[5px] bg-[#fcfdfd] text-[#172431] font-normal outline-none focus:border-[#c69b46] focus:ring-3 focus:ring-[#c69b4618]" name="name" required autoComplete="name" />
        </label>
        <label className="block my-[16px] text-[#344c5e] text-[12px] font-extrabold">
          Email address
          <input className="block w-full mt-[8px] p-[13px_14px] border border-[#ccd6dc] rounded-[5px] bg-[#fcfdfd] text-[#172431] font-normal outline-none focus:border-[#c69b46] focus:ring-3 focus:ring-[#c69b4618]" name="email" type="email" required autoComplete="email" />
        </label>
      </div>
      <div className="grid grid-cols-1 min-[651px]:grid-cols-2 gap-[16px]">
        <label className="block my-[16px] text-[#344c5e] text-[12px] font-extrabold">
          Phone number
          <input className="block w-full mt-[8px] p-[13px_14px] border border-[#ccd6dc] rounded-[5px] bg-[#fcfdfd] text-[#172431] font-normal outline-none focus:border-[#c69b46] focus:ring-3 focus:ring-[#c69b4618]" name="phone" type="tel" required autoComplete="tel" />
        </label>
        <label className="block my-[16px] text-[#344c5e] text-[12px] font-extrabold">
          Institution or lender name
          <input className="block w-full mt-[8px] p-[13px_14px] border border-[#ccd6dc] rounded-[5px] bg-[#fcfdfd] text-[#172431] font-normal outline-none focus:border-[#c69b46] focus:ring-3 focus:ring-[#c69b4618]" name="organization" required />
        </label>
      </div>
      <label className="block my-[16px] text-[#344c5e] text-[12px] font-extrabold">
        Type of institution or lending activity
        <select className="block w-full mt-[8px] p-[13px_14px] border border-[#ccd6dc] rounded-[5px] bg-[#fcfdfd] text-[#172431] font-normal outline-none focus:border-[#c69b46] focus:ring-3 focus:ring-[#c69b4618]" name="related_name" required defaultValue="">
          <option value="" disabled>
            Select one
          </option>
          <option>Bank or financial institution</option>
          <option>Mortgage company</option>
          <option>Private lending company</option>
          <option>Business offering financing</option>
          <option>Investment or partnership structure</option>
          <option>Individual private lender</option>
          <option>Other</option>
        </select>
      </label>
      <label className="block my-[16px] text-[#344c5e] text-[12px] font-extrabold">
        Describe the ownership, products, agreements, and lending structure
        <textarea
          className="block w-full mt-[8px] p-[13px_14px] border border-[#ccd6dc] rounded-[5px] bg-[#fcfdfd] text-[#172431] font-normal outline-none focus:border-[#c69b46] focus:ring-3 focus:ring-[#c69b4618] resize-y"
          name="message"
          rows={7}
          minLength={20}
          required
          placeholder="Describe who lends, who borrows, the types of loans or financing offered, and any special terms…"
        />
      </label>
      <label className="block my-[16px] text-[#344c5e] text-[12px] font-extrabold">
        Preferred response method
        <select className="block w-full mt-[8px] p-[13px_14px] border border-[#ccd6dc] rounded-[5px] bg-[#fcfdfd] text-[#172431] font-normal outline-none focus:border-[#c69b46] focus:ring-3 focus:ring-[#c69b4618]" name="response_method">
          <option>Email</option>
          <option>Phone</option>
          <option>Either email or phone</option>
        </select>
      </label>
      <label className="block my-[16px] text-[#344c5e] text-[12px] font-extrabold">
        Supporting document <em className="not-italic text-[#88949c] font-normal">optional</em>
        <input
          className="block w-full mt-[8px] p-[13px_14px] border border-[#ccd6dc] rounded-[5px] bg-[#fcfdfd] text-[#172431] font-normal outline-none focus:border-[#c69b46] focus:ring-3 focus:ring-[#c69b4618]"
          name="attachment"
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp,.doc,.docx"
        />
        <small className="block mt-[7px] text-[#7b8992] leading-[1.5] font-normal text-xs">
          Upload an existing agreement or Heter Iska if helpful. PDF, Word, JPG,
          PNG, or WEBP up to 10 MB.
        </small>
      </label>
      <label className={`flex items-start gap-[14px] my-[23px] p-[20px] border-2 rounded-[9px] cursor-pointer transition-colors ${discount ? 'border-[#c69b46] bg-[#fff8e8]' : 'border-[#d9dfe2] bg-[#f8fafb]'}`}>
        <input
          type="checkbox"
          className="w-[20px] h-[20px] shrink-0 my-[1px] accent-[#c69b46]"
          checked={discount}
          onChange={(event) => setDiscount(event.target.checked)}
        />
        <span className="flex flex-col gap-[6px] text-[#344c5e] font-normal text-[14px]">Check this box if you would like the discounted $120 price.</span>
      </label>
      <div className="flex items-center justify-between -mt-[8px] mb-[18px] p-[14px_18px] rounded-[6px] bg-[#102a43] text-white">
        <span className="text-[11px] font-extrabold tracking-[0.1em] uppercase">Requested price</span>
        <strong className="text-[#efd18b] font-serif text-[30px] font-bold">{discount ? '$120' : '$250'}</strong>
      </div>
      <button className="w-full inline-flex justify-center items-center p-[15px] rounded-[5px] border-0 bg-[#c69b46] hover:bg-[#b58a35] text-white font-bold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={busy}>
        {busy ? 'Submitting…' : 'Submit Personalized Heter Iska Request →'}
      </button>
      {error && (
        <p className="text-[#a52d2d] bg-[#fff0f0] p-[10px] rounded-[4px] mt-3 text-sm" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

