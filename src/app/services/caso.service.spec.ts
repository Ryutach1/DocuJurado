import { describe, expect, it } from 'vitest';
import { CasoService } from './caso.service';

describe('CasoService', () => {
  it('resets all case data to fresh defaults', () => {
    const service = new CasoService();
    const previousCase = service.obtenerCaso();
    previousCase.demandante.nombre = 'Dato de prueba';
    previousCase.gastos.habitacion.monto = 1200;
    previousCase.datosMatrimonio.registro.numeroActa = 'ACTA-PRUEBA';

    service.limpiarCaso();

    const resetCase = service.obtenerCaso();
    expect(resetCase.demandante.nombre).toBe('');
    expect(resetCase.gastos.habitacion.monto).toBe(0);
    expect(resetCase.datosMatrimonio.registro.numeroActa).toBe('');
    expect(resetCase.gastos.habitacion.periodicidad).toBe('Mensual');
    expect(resetCase).not.toBe(previousCase);
    expect(resetCase.gastos).not.toBe(previousCase.gastos);
  });
});
