import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toast } from "sonner";

export async function generatePDF(elementId: string, fileName: string = 'mission-report.pdf') {
    const element = document.getElementById(elementId);
    if (!element) {
        toast.error("Export Failed", { description: "Report element not found." });
        return;
    }

    try {
        toast.info("Generating Report...", { description: "Compiling mission data." });

        const canvas = await html2canvas(element, {
            scale: 2, // Higher resolution
            useCORS: true,
            backgroundColor: '#18181b', // Match dark theme
            logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(fileName);
        toast.success("Export Complete", { description: "Mission report downloaded." });
    } catch (error) {
        console.error("PDF Export Error:", error);
        toast.error("Export Failed", { description: "Could not generate PDF." });
    }
}
