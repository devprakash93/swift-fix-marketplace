export const estimatePrice = async (req, res) => {
  const { description, category } = req.body;
  
  // Simulated AI logic
  let estimate = 50;
  if (description.toLowerCase().includes('leak')) estimate += 20;
  if (description.toLowerCase().includes('urgent')) estimate += 30;
  if (description.toLowerCase().includes('multiple')) estimate += 50;

  // Simulate AI delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  res.json({
    estimate: `₹${estimate} - ₹${estimate + 40}`,
    confidence: 0.92,
    advice: "Based on your description, this sounds like a standard repair but might require spare parts."
  });
};

export const detectIssue = async (req, res) => {
  const { imageUrl } = req.body;
  
  // Simulated Image Recognition
  await new Promise(resolve => setTimeout(resolve, 2000));

  res.json({
    issue: "Corroded Pipe Joint",
    suggestedCategory: "Plumbing",
    severity: "High",
    confidence: 0.88
  });
};
