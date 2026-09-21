import Land from "../models/Lands.js";

const landController = {};

// Obtener todos los terrenos
landController.getLands = async (req, res) => {
  try {
    const lands = await Land.find().sort({ createdAt: -1 });

    const response = lands.map((land) => {
      const landObj = land.toObject();
      landObj.saldoRemanente = Math.max(0, (landObj.costoTerreno || 0) - (landObj.montoAbonado || 0));
      return landObj;
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener la lista de terrenos",
      error: error.message,
    });
  }
};

// Obtener terreno por ID
landController.getLandById = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);
    if (!land) {
      return res.status(404).json({ message: "Registro de terreno no encontrado" });
    }

    const landObj = land.toObject();
    landObj.saldoRemanente = Math.max(0, (landObj.costoTerreno || 0) - (landObj.montoAbonado || 0));

    res.json(landObj);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el terreno",
      error: error.message,
    });
  }
};

// Crear terreno (ROBUSTO)
landController.createLand = async (req, res) => {
  const {
    nombreCliente,
    direccion,
    telefono,
    dimensionTerreno,
    costoTerreno,
    montoAbonado,
    fechaVenta,
    tipoVenta,
    numeroCuotas,
    montoCuotaMensual,
    observaciones,
  } = req.body;

  try {
    if (!nombreCliente || !nombreCliente.trim()) {
      return res.status(400).json({ message: "El nombre del cliente es obligatorio." });
    }
    if (!direccion || !direccion.trim()) {
      return res.status(400).json({ message: "La dirección es obligatoria." });
    }
    if (!telefono || !telefono.trim()) {
      return res.status(400).json({ message: "El teléfono es obligatorio." });
    }
    if (!dimensionTerreno || !dimensionTerreno.trim()) {
      return res.status(400).json({ message: "La dimensión del terreno es obligatoria." });
    }
    if (costoTerreno === undefined || costoTerreno === null || isNaN(costoTerreno)) {
      return res.status(400).json({ message: "El costo del terreno es obligatorio." });
    }
    if (!fechaVenta) {
      return res.status(400).json({ message: "La fecha de venta es obligatoria." });
    }

    const esPromesa = tipoVenta === "Promesa";

    const landData = {
      nombreCliente: nombreCliente.trim(),
      direccion: direccion.trim(),
      telefono: telefono.trim(),
      dimensionTerreno: dimensionTerreno.trim(),
      costoTerreno: Number(costoTerreno),
      montoAbonado: montoAbonado != null && !isNaN(montoAbonado) ? Number(montoAbonado) : 0,
      fechaVenta: new Date(fechaVenta),
      tipoVenta: esPromesa ? "Promesa" : "Contado",
      numeroCuotas: esPromesa && numeroCuotas != null && !isNaN(numeroCuotas) ? Number(numeroCuotas) : null,
      montoCuotaMensual: esPromesa && montoCuotaMensual != null && !isNaN(montoCuotaMensual) ? Number(montoCuotaMensual) : null,
      observaciones: observaciones ? observaciones.trim() : "",
    };

    const newLand = new Land(landData);
    const savedLand = await newLand.save();

    const responseObj = savedLand.toObject();
    responseObj.saldoRemanente = Math.max(0, responseObj.costoTerreno - responseObj.montoAbonado);

    res.status(201).json(responseObj);
  } catch (error) {
    console.error("Error detallado en createLand (BACKEND):", error);

    // Si es error de duplicado (E11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "campo";
      return res.status(400).json({
        message: `Ya existe un terreno registrado con ese mismo '${field}'.`,
      });
    }

    res.status(500).json({
      message: `Error en base de datos: ${error.message}`,
      error: error.message,
    });
  }
};

// Actualizar terreno
landController.updateLand = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  try {
    const land = await Land.findById(id);
    if (!land) {
      return res.status(404).json({ message: "Registro de terreno no encontrado" });
    }

    if (updates.tipoVenta === "Contado") {
      updates.numeroCuotas = null;
      updates.montoCuotaMensual = null;
    }

    if (updates.fechaVenta) {
      updates.fechaVenta = new Date(updates.fechaVenta);
    }

    Object.keys(updates).forEach((key) => {
      land[key] = updates[key];
    });

    const updatedLand = await land.save();
    const responseObj = updatedLand.toObject();
    responseObj.saldoRemanente = Math.max(0, responseObj.costoTerreno - responseObj.montoAbonado);

    res.status(200).json(responseObj);
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el terreno",
      error: error.message,
    });
  }
};

// Eliminar terreno
landController.deleteLand = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);
    if (!land) {
      return res.status(404).json({ message: "Registro de terreno no encontrado" });
    }

    await land.deleteOne();
    res.status(200).json({ message: "Terreno eliminado correctamente" });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el terreno",
      error: error.message,
    });
  }
};

export default landController;