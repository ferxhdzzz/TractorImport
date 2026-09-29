import Customer from "../models/Customers.js";
import Products from "../models/Products.js";

const customerController = {};

// Obtener todos los clientes
customerController.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().populate("maquinariaComprada");
    res.json(customers);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener la lista de clientes",
      error: error.message,
    });
  }
};

// Obtener un cliente por su ID
customerController.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate("maquinariaComprada");

    if (!customer) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener la información del cliente",
      error: error.message,
    });
  }
};

// Registrar un nuevo cliente / compra múltiple
customerController.createCustomer = async (req, res) => {
  const {
    nombreCliente,
    maquinariaComprada, // Puede ser un ID único o un Arreglo de IDs ["id1", "id2", "id3"]
    precioFinal,
    fechaCompra,
    aplicaAbono,
    abonoPagado,
    fechaAbono,
    remanente,
    metodoPago,
    observaciones,
  } = req.body;

  try {
    if (!nombreCliente || !nombreCliente.trim() || !maquinariaComprada || precioFinal == null || !fechaCompra) {
      return res.status(400).json({
        message: "Faltan campos obligatorios.",
      });
    }

    // Normalizar a Arreglo en caso de que envíen un solo ID o un array
    const listaMaquinaria = Array.isArray(maquinariaComprada)
      ? maquinariaComprada
      : [maquinariaComprada];

    if (listaMaquinaria.length === 0) {
      return res.status(400).json({
        message: "Debe seleccionar al menos una maquinaria.",
      });
    }

    // Verificar existencia de cada maquinaria en Products
    const productosEncontrados = await Products.find({
      _id: { $in: listaMaquinaria },
    });

    if (productosEncontrados.length !== listaMaquinaria.length) {
      return res.status(404).json({
        message: "Una o más maquinarias seleccionadas no existen en el inventario.",
      });
    }

    const newCustomer = new Customer({
      nombreCliente: nombreCliente.trim(),
      maquinariaComprada: listaMaquinaria, // Guardamos la lista completa
      precioFinal: Number(precioFinal),
      fechaCompra,
      aplicaAbono: Boolean(aplicaAbono),
      abonoPagado: aplicaAbono ? Number(abonoPagado) || 0 : null,
      fechaAbono: aplicaAbono && fechaAbono ? fechaAbono : null,
      remanente: remanente != null ? Number(remanente) : 0,
      metodoPago: metodoPago || "Transferencia",
      observaciones: observaciones ? observaciones.trim() : "",
    });

    const savedCustomer = await newCustomer.save();

    // Poblado directo sobre la lista
    await savedCustomer.populate("maquinariaComprada");

    res.status(201).json(savedCustomer);
  } catch (error) {
    console.error("Error en createCustomer:", error);
    res.status(500).json({
      message: "Error al registrar el cliente",
      error: error.message,
    });
  }
};

// Actualizar registro de cliente
customerController.updateCustomer = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  try {
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    if (updates.maquinariaComprada) {
      const listaMaquinaria = Array.isArray(updates.maquinariaComprada)
        ? updates.maquinariaComprada
        : [updates.maquinariaComprada];

      const productosEncontrados = await Products.find({
        _id: { $in: listaMaquinaria },
      });

      if (productosEncontrados.length !== listaMaquinaria.length) {
        return res.status(404).json({
          message: "Una o más maquinarias seleccionadas no existen.",
        });
      }

      updates.maquinariaComprada = listaMaquinaria;
    }

    Object.keys(updates).forEach((key) => {
      customer[key] = updates[key];
    });

    const updatedCustomer = await customer.save();
    await updatedCustomer.populate("maquinariaComprada");

    res.status(200).json(updatedCustomer);
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el cliente",
      error: error.message,
    });
  }
};

// Eliminar cliente
customerController.deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    await customer.deleteOne();
    res.status(200).json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el cliente",
      error: error.message,
    });
  }
};

export default customerController;