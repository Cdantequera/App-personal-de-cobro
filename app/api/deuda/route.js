import { NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Deuda from '../../models/Deuda';

export const dynamic = 'force-dynamic';
export const revalidate = 0

export async function GET() {
  await dbConnect();
  try {
    let cuenta = await Deuda.findOne();
    if (!cuenta) {
      cuenta = await Deuda.create({
        deudaTotal: 0, saldoActual: 0, estado: 'aprobada', pagos: []
      });
    }

return NextResponse.json(
      { success: true, data: cuenta },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  try {
    const { monto, fecha, nota } = await request.json();
    const cuenta = await Deuda.findOne();
    
    if (!cuenta) throw new Error("Cuenta no encontrada");
    if (cuenta.estado === 'pendiente') throw new Error("El deudor aún no aprobó la deuda de este mes.");
    if (cuenta.pagoPendiente) throw new Error("Ya hay un pago pendiente de aprobación.");

    // En lugar de descontar, lo dejamos en espera
    cuenta.pagoPendiente = { monto: Number(monto), fecha, nota };
    await cuenta.save();

    return NextResponse.json({ success: true, data: cuenta });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request) {
  await dbConnect();
  try {
    const body = await request.json();
    const cuenta = await Deuda.findOne();
    if (!cuenta) throw new Error("Cuenta no encontrada");

    if (body.accion === 'nueva_deuda') {
      cuenta.deudaTotal = Number(body.monto);
      cuenta.saldoActual = Number(body.monto);
      cuenta.pagos = []; 
      cuenta.estado = 'pendiente'; 
      cuenta.pagoPendiente = null; // Limpiamos si había un error colgado
    }
    
    if (body.accion === 'aprobar') {
      cuenta.estado = 'aprobada';
    }

    // NUEVO: El deudor aprueba el pago específico
    if (body.accion === 'aprobar_pago') {
      if (!cuenta.pagoPendiente) throw new Error("No hay pago pendiente.");
      cuenta.saldoActual -= cuenta.pagoPendiente.monto;
      cuenta.pagos.push(cuenta.pagoPendiente);
      cuenta.pagoPendiente = null; // Vaciamos el temporal
    }

    // NUEVO: El deudor rechaza el pago por error
    if (body.accion === 'rechazar_pago') {
      cuenta.pagoPendiente = null; // Vaciamos el temporal sin descontar nada
    }
    if (body.accion === 'cancelar_pago') {
  cuenta.pagoPendiente = null;
}

    await cuenta.save();
    return NextResponse.json({ success: true, data: cuenta });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}