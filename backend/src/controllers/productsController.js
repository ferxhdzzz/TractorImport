import Inventory from "../models/Products.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

// Configuración de Cloudinary (Usa variables de entorno en producción)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dosy4rouu',
  api_key: process.env.CLOUDINARY_API_KEY || '712175425427873',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'Yk2vqXqQ6aknOrT7FCoqEiWw31w',
});

const inventoryController = {};

// Obtener todo el inventario
inventoryController.getInventory = async (req, res) => {
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el inventario", error: error.message });
  }
};

// Obtener un elemento de inventario por ID
inventoryController.getInventoryById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Elemento no encontrado en el inventario" });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: "Error al obtener el elemento", error: error.message });
  }
};

// Crear un elemento en el inventario
inventoryController.createInventory = async (req, res) => {
  const {
    nombreMaquinaria,
    descripcion,
    costoMaquinaria,
    numeroContenedor,
    fechaCompra,
    impuestoPagado,
    costoTransporte,
    precioFinal,
    observaciones
  } = req.body;

  try {
    // Validación de campos obligatorios
    if (!nombreMaquinaria || !nombreMaquinaria.trim() || costoMaquinaria == null || !numeroContenedor || !fechaCompra) {
      return res.status(400).json({ message: "Faltan campos obligatorios del inventario" });
    }

    // Validación de costos
    if (isNaN(costoMaquinaria) || Number(costoMaquinaria) < 0) {
      return res.status(400).json({ message: "El costo de la maquinaria debe ser un número mayor o igual a 0" });
    }

    // Subida de imagen a Cloudinary (soporta req.files array o req.file único)
    let imagenUrl = "";
    
    if (req.files && req.files.length > 0) {
      const file = req.files[0];
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "inventory",
        allowed_formats: ["png", "jpg", "jpeg", "webp"],
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto" }
        ]
      });
      imagenUrl = result.secure_url;
      await fs.unlink(file.path); // Elimina el archivo temporal local
    } else if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "inventory",
        allowed_formats: ["png", "jpg", "jpeg", "webp"],
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto" }
        ]
      });
      imagenUrl = result.secure_url;
      await fs.unlink(req.file.path);
    } else if (req.body.imagenUrl) {
      imagenUrl = req.body.imagenUrl;
    }

    // Cálculo del precio final si no fue enviado expresamente desde el cliente
    const costoNum = Number(costoMaquinaria) || 0;
    const impuestoNum = Number(impuestoPagado) || 0;
    const transporteNum = Number(costoTransporte) || 0;
    const finalCalculado = precioFinal != null ? Number(precioFinal) : (costoNum + impuestoNum + transporteNum);

    // Crear la instancia de Maquinaria/Inventario
    const newInventory = new Inventory({
      nombreMaquinaria: nombreMaquinaria.trim(),
      descripcion: descripcion ? descripcion.trim() : "",
      costoMaquinaria: costoNum,
      numeroContenedor: numeroContenedor.trim(),
      fechaCompra,
      impuestoPagado: impuestoNum,
      costoTransporte: transporteNum,
      precioFinal: finalCalculado,
      observaciones: observaciones ? observaciones.trim() : "",
      imagenUrl
    });

    const savedInventory = await newInventory.save();
    res.status(201).json(savedInventory);
  } catch (error) {
    res.status(500).json({ message: "Error al crear elemento en el inventario", error: error.message });
  }
};

// Actualizar un elemento del inventario
inventoryController.updateInventory = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  try {
    const item = await Inventory.findById(id);
    if (!item) return res.status(404).json({ message: "Elemento de inventario no encontrado" });

    // Validar costo si se actualiza
    if (updates.costoMaquinaria !== undefined) {
      if (isNaN(updates.costoMaquinaria) || Number(updates.costoMaquinaria) < 0) {
        return res.status(400).json({ message: "El costo de la maquinaria debe ser un número válido" });
      }
      updates.costoMaquinaria = Number(updates.costoMaquinaria);
    }

    // Procesar nueva imagen si fue subida
    let nuevaImagenUrl = item.imagenUrl;

    if (req.files && req.files.length > 0) {
      const file = req.files[0];
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "inventory",
        allowed_formats: ["png", "jpg", "jpeg", "webp"],
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto" }
        ]
      });
      nuevaImagenUrl = result.secure_url;
      await fs.unlink(file.path);
    } else if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "inventory",
        allowed_formats: ["png", "jpg", "jpeg", "webp"],
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto" }
        ]
      });
      nuevaImagenUrl = result.secure_url;
      await fs.unlink(req.file.path);
    } else if (updates.imagenUrl) {
      nuevaImagenUrl = updates.imagenUrl;
    }

    item.imagenUrl = nuevaImagenUrl;

    // Aplicar actualizaciones al objeto del documento
    Object.keys(updates).forEach(key => {
      if (key !== "imagenUrl") {
        item[key] = updates[key];
      }
    });

    // Recalcular el precio final
    const c = Number(item.costoMaquinaria) || 0;
    const i = Number(item.impuestoPagado) || 0;
    const t = Number(item.costoTransporte) || 0;
    item.precioFinal = c + i + t;

    const updatedInventory = await item.save();
    res.status(200).json(updatedInventory);

  } catch (error) {
    console.error("Error al actualizar el inventario:", error);
    res.status(500).json({ message: "Error al actualizar el inventario", error: error.message });
  }
};

// Eliminar un elemento del inventario
inventoryController.deleteInventory = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await Inventory.findById(id);
    if (!item) return res.status(404).json({ message: "Elemento de inventario no encontrado" });

    await item.deleteOne();
    res.status(200).json({ message: "Elemento de inventario eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el elemento del inventario", error: error.message });
  }
};

export default inventoryController;