import Inventory from "../models/Products.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dosy4rouu",
  api_key: process.env.CLOUDINARY_API_KEY || "712175425427873",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "Yk2vqXqQ6aknOrT7FCoqEiWw31d",
});

const inventoryController = {};

// =====================================================
// OBTENER TODO EL INVENTARIO
// =====================================================
inventoryController.getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el inventario",
      error: error.message,
    });
  }
};

// =====================================================
// OBTENER INVENTARIO POR ID
// =====================================================
inventoryController.getInventoryById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Elemento no encontrado en el inventario",
      });
    }

    res.json(item);
  } catch (error) {
    res.status(400).json({
      message: "Error al obtener el elemento",
      error: error.message,
    });
  }
};

// =====================================================
// FUNCIÓN PARA SUBIR IMAGEN A CLOUDINARY
// =====================================================
const uploadImageToCloudinary = async (file) => {
  if (!file || !file.path) return "";

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "inventory",
      allowed_formats: ["png", "jpg", "jpeg", "webp"],
      quality: "auto:best",
      resource_type: "image",
    });

    // Eliminar archivo temporal local
    await fs.unlink(file.path).catch(() => {});

    return result.secure_url;
  } catch (error) {
    await fs.unlink(file.path).catch(() => {});
    throw error;
  }
};

// =====================================================
// CREAR ELEMENTO EN EL INVENTARIO (TODOS LOS CAMPOS OPCIONALES)
// =====================================================
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
    observaciones,
  } = req.body;

  try {
    const costoNum = costoMaquinaria != null && costoMaquinaria !== "" ? Number(costoMaquinaria) || 0 : 0;
    const impuestoNum = Number(impuestoPagado) || 0;
    const transporteNum = Number(costoTransporte) || 0;

    if (costoNum < 0) {
      return res.status(400).json({
        message: "El costo de la maquinaria debe ser un número mayor o igual a 0",
      });
    }

    // MANEJO DE UNA SOLA IMAGEN
    let imageUrl = "";

    if (req.file) {
      // Subir el archivo físico procesado por upload.single("image")
      const uploadedUrl = await uploadImageToCloudinary(req.file);
      if (uploadedUrl) imageUrl = uploadedUrl;
    } else if (req.body.imagenUrl) {
      imageUrl = req.body.imagenUrl.trim();
    }

    const finalValue =
      precioFinal !== undefined && precioFinal !== null && precioFinal !== ""
        ? Number(precioFinal) || 0
        : costoNum + impuestoNum + transporteNum;

    const newInventory = new Inventory({
      nombreMaquinaria: nombreMaquinaria ? nombreMaquinaria.trim() : "",
      descripcion: descripcion ? descripcion.trim() : "",
      costoMaquinaria: costoNum,
      numeroContenedor: numeroContenedor ? numeroContenedor.trim() : "",
      fechaCompra: fechaCompra || null,
      impuestoPagado: impuestoNum,
      costoTransporte: transporteNum,
      precioFinal: isNaN(finalValue) ? 0 : finalValue,
      observaciones: observaciones ? observaciones.trim() : "",
      imagenUrl: imageUrl,
    });

    const savedInventory = await newInventory.save();

    res.status(201).json(savedInventory);
  } catch (error) {
    console.error("Error al crear elemento en el inventario:", error);

    res.status(500).json({
      message: "Error al crear elemento en el inventario",
      error: error.message,
    });
  }
};


// =====================================================
// ACTUALIZAR INVENTARIO (REEMPLAZAR / ELIMINAR FOTO ÚNICA)
// =====================================================
inventoryController.updateInventory = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  try {
    const item = await Inventory.findById(id);

    if (!item) {
      return res.status(404).json({
        message: "Elemento de inventario no encontrado",
      });
    }

    // 1. CAMPOS NUMÉRICOS
    if (updates.costoMaquinaria !== undefined) item.costoMaquinaria = Number(updates.costoMaquinaria) || 0;
    if (updates.impuestoPagado !== undefined) item.impuestoPagado = Number(updates.impuestoPagado) || 0;
    if (updates.costoTransporte !== undefined) item.costoTransporte = Number(updates.costoTransporte) || 0;
    if (updates.precioFinal !== undefined) item.precioFinal = Number(updates.precioFinal) || 0;

    // 2. CAMPOS DE TEXTO Y FECHA
    if (updates.nombreMaquinaria !== undefined) item.nombreMaquinaria = updates.nombreMaquinaria.trim();
    if (updates.numeroContenedor !== undefined) item.numeroContenedor = updates.numeroContenedor.trim();
    if (updates.fechaCompra !== undefined) item.fechaCompra = updates.fechaCompra || null;
    if (updates.descripcion !== undefined) item.descripcion = updates.descripcion.trim();
    if (updates.observaciones !== undefined) item.observaciones = updates.observaciones.trim();

    // 3. ARCHIVO SUBIDO POR MULTER (req.file)
    const uploadedFile = req.file;

    // 4. LÓGICA DE IMAGEN ÚNICA
    if (uploadedFile) {
      // Subir archivo nuevo a Cloudinary
      const uploadedUrl = await uploadImageToCloudinary(uploadedFile);
      if (uploadedUrl) {
        item.imagenUrl = uploadedUrl;
      }
    } else if (updates.imagenUrl !== undefined) {
      // Mantiene la URL existente o la limpia si viene ""
      item.imagenUrl = String(updates.imagenUrl).trim();
    }

    // ELIMINAR EL ARRAY OBSOLETO 'images' EN MONGO DB
    item.set("images", undefined);

    const updatedInventory = await item.save();

    return res.status(200).json(updatedInventory);
  } catch (error) {
    console.error("Error al actualizar el inventario:", error);

    return res.status(500).json({
      message: "Error al actualizar el inventario",
      error: error.message,
    });
  }
};
// =====================================================
// ELIMINAR INVENTARIO
// =====================================================
inventoryController.deleteInventory = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await Inventory.findById(id);

    if (!item) {
      return res.status(404).json({
        message: "Elemento de inventario no encontrado",
      });
    }

    await item.deleteOne();

    res.status(200).json({
      message: "Elemento de inventario eliminado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el elemento del inventario",
      error: error.message,
    });
  }
};

export default inventoryController;