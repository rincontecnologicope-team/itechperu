export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const faqs: FaqItem[] = [
  {
    id: "originales",
    question: "¿Los productos son originales?",
    answer:
      "Si. Trabajamos con equipos originales importados de USA y verificamos numero de serie, estado fisico y funcionamiento antes de publicarlos.",
  },
  {
    id: "garantia",
    question: "¿Tienen garantia?",
    answer:
      "Si, todos los equipos se entregan con garantia funcional. Si aparece una falla cubierta, te asistimos de inmediato por WhatsApp 🤝",
  },
  {
    id: "contraentrega",
    question: "¿Como funciona la contraentrega?",
    answer:
      "Coordinamos punto y horario en Lima, revisas el producto y luego realizas el pago. Buscamos que compres con total confianza.",
  },
  {
    id: "provincia",
    question: "¿Realizan envios a provincia?",
    answer:
      "Si. Enviamos a nivel nacional mediante Shalom con embalaje seguro y seguimiento para que recibas tu compra sin riesgo 📦",
  },
  {
    id: "probados",
    question: "¿Los equipos estan probados?",
    answer:
      "Si. Probamos pantalla, bateria, puertos, camaras, conectividad y rendimiento general para asegurar que el equipo llegue operativo al 100% 💯",
  },
];
