import { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import mail from "./assets/mail.png";

function App() {
  const [from] = useState("hrithikasridhar2@gmail.com"); // Default
  const [subject, setSubject] = useState("");
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState(false);
  const [emailList, setEmailList] = useState([]);

  const handleFile = (evt) => {
    const file = evt.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet, { header: "A" });
      const emails = data.map((row) => row.A).filter(Boolean);
      setEmailList(emails);
    };
    reader.readAsBinaryString(file);
  };

  const sendEmails = async () => {
    if (!subject || !msg || emailList.length === 0) {
      alert("Please enter subject, message, and upload emails");
      return;
    }

    setStatus(true);
    try {
      const res = await axios.post("http://localhost:5000/sendMail", {
        msg,
        subject,
        emailList,
      });

      if (res.data.status === "success") {
        alert(`✅ Emails sent successfully to ${res.data.sent} recipients`);
      } else if (res.data.status === "partial") {
        alert(`⚠️ Partial success. Sent: ${res.data.sent}, Failed: ${res.data.failed}`);
      } else {
        alert("❌ Failed to send emails");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error sending emails");
    } finally {
      setStatus(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 px-4 py-8">
      <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-lg p-6 md:p-10">
        {/* Header */}
        <div className="flex items-center mb-2 text-center justify-center gap-2">
          <h1 className="text-4xl font-bold text-pink-400">Bulk Mailer</h1>
          <img src={mail} alt="" className="h-14" />
        </div>
        <p className="flex gap-2 justify-center text-gray-400 text-center mb-8">
          Send professional emails to <span className="text-pink-400">multiple recipients</span>
        </p>

        <div className="space-y-6">
          {/* From */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">From</label>
            <input
              type="email"
              value={from}
              disabled
              className="w-full bg-neutral-800 rounded-lg border border-neutral-700 text-gray-400 p-3 cursor-not-allowed"
            />
          </div>

          {/* To (File Upload) */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">To (Excel File)</label>
            <input
              type="file"
              onChange={handleFile}
              className="w-full border-2 border-dashed border-pink-400 rounded-lg p-3 text-gray-200 cursor-pointer hover:bg-pink-400/10 transition"
            />
            <p className="mt-2 text-gray-400 text-sm">
              {emailList.length > 0 ? `✅ ${emailList.length} emails loaded` : "Upload an Excel file with emails"}
            </p>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-neutral-800 rounded-lg border border-neutral-700 focus:border-pink-400 focus:ring-2 focus:ring-pink-500 text-gray-100 p-3"
              placeholder="Enter email subject..."
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-gray-300 mb-2 font-medium">Message</label>
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className="h-40 w-full bg-neutral-800 rounded-lg border border-neutral-700 focus:border-pink-400 focus:ring-2 focus:ring-pink-400 text-gray-100 p-4 resize-none"
              placeholder="Type your email message..."
            ></textarea>
          </div>

          {/* Send Button */}
          <div className="flex justify-center">
            <button
              onClick={sendEmails}
              disabled={status}
              className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status ? "Sending..." : "Send Email"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
