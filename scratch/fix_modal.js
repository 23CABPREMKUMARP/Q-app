const fs = require('fs');

const path = 'app/town-bus/[tripId]/seat-selection/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Change Payment Verified Colors
content = content.replace(
  '<CheckCircle2 size={32} className="text-[#F28500]" />',
  '<CheckCircle2 size={32} className="text-[#22C55E]" />'
);

content = content.replace(
  'className="text-2xl font-bold text-zinc-900 tracking-tight uppercase"\n                  >\n                    Payment Verified',
  'className="text-2xl font-bold text-[#22C55E] tracking-tight uppercase"\n                  >\n                    Payment Verified'
);

// 2. Extract and Move Modal
// We need to carefully find the block:
//       {/* FULL TICKET MODAL */}
//       <AnimatePresence>
//         {selectedTicket && (
//            ...
//         )}
//       </AnimatePresence>
// And remove it from inside `if (isProcessingRedirect) {`
const modalStartStr = "      {/* FULL TICKET MODAL */}\n      <AnimatePresence>\n        {selectedTicket && (";
const modalStartIndex = content.indexOf(modalStartStr);

if (modalStartIndex !== -1) {
  // Find the end of this AnimatePresence block
  const modalEndStr = "      </AnimatePresence>";
  const modalEndIndex = content.indexOf(modalEndStr, modalStartIndex) + modalEndStr.length;
  
  const modalCode = content.substring(modalStartIndex, modalEndIndex);
  
  // Remove it from the original location
  content = content.slice(0, modalStartIndex) + content.slice(modalEndIndex);
  
  // Insert it before the last </SecureView>
  const insertIndex = content.lastIndexOf("    </SecureView>");
  if (insertIndex !== -1) {
    content = content.slice(0, insertIndex) + modalCode + "\n\n" + content.slice(insertIndex);
  } else {
    console.log("Could not find insert position");
  }
} else {
  console.log("Could not find modal block");
}

fs.writeFileSync(path, content);
console.log("Done");
