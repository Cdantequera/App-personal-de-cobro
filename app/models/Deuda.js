import mongoose from 'mongoose';

const PagoSchema = new mongoose.Schema({
  monto: { type: Number, required: true },
  fecha: { type: String, required: true },
  nota: { type: String, default: 'Pago registrado' }
});

const DeudaSchema = new mongoose.Schema({
  sujetoA: { type: String, default: 'Deudor' },
  sujetoB: { type: String, default: 'Acreedor' },
  deudaTotal: { type: Number, required: true },
  saldoActual: { type: Number, required: true },
  estado: { type: String, default: 'aprobada' },
  pagoPendiente: { 
  type: {
    monto: { type: Number },
    fecha: { type: String },
    nota: { type: String }
  },
  default: null
},
  pagos: [PagoSchema]
}, { timestamps: true });

export default mongoose.models.Deuda || mongoose.model('Deuda', DeudaSchema);