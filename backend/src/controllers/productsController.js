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
// CREAR ELEMENTO EN EL INVENTARIO
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
    if (
      !nombreMaquinaria ||
      !nombreMaquinaria.trim() ||
      costoMaquinaria == null ||
      !numeroContenedor ||
      !fechaCompra
    ) {
      return res.status(400).json({
        message: "Faltan campos obligatorios del inventario",
      });
    }

    const costoNum = Number(costoMaquinaria);
    if (isNaN(costoNum) || costoNum < 0) {
      return res.status(400).json({
        message:
          "El costo de la maquinaria debe ser un número mayor o igual a 0",
      });
    }

    let uploadedImages = [];

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadImageToCloudinary(file)
      );
      uploadedImages = await Promise.all(uploadPromises);
    } else if (req.file) {
      const singleUrl = await uploadImageToCloudinary(req.file);
      if (singleUrl) uploadedImages.push(singleUrl);
    } else if (req.body.imagenUrl) {
      uploadedImages.push(req.body.imagenUrl);
    }

    const impuestoNum = Number(impuestoPagado) || 0;
    const transporteNum = Number(costoTransporte) || 0;

    const finalValue =
      precioFinal !== undefined && precioFinal !== null && precioFinal !== ""
        ? Number(precioFinal)
        : costoNum + impuestoNum + transporteNum;

    const newInventory = new Inventory({
      nombreMaquinaria: nombreMaquinaria.trim(),
      descripcion: descripcion ? descripcion.trim() : "",
      costoMaquinaria: costoNum,
      numeroContenedor: numeroContenedor.trim(),
      fechaCompra,
      impuestoPagado: impuestoNum,
      costoTransporte: transporteNum,
      precioFinal: isNaN(finalValue) ? 0 : finalValue,
      observaciones: observaciones ? observaciones.trim() : "",
      images: uploadedImages,
      imagenUrl: uploadedImages[0] || "",
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
// ACTUALIZAR INVENTARIO (CONSERVANDO IMÁGENES EXISTENTES)
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

    // CAMPOS NUMÉRICOS
    if (updates.costoMaquinaria !== undefined) {
      item.costoMaquinaria = Number(updates.costoMaquinaria) || 0;
    }
    if (updates.impuestoPagado !== undefined) {
      item.impuestoPagado = Number(updates.impuestoPagado) || 0;
    }
    if (updates.costoTransporte !== undefined) {
      item.costoTransporte = Number(updates.costoTransporte) || 0;
    }
    if (updates.precioFinal !== undefined) {
      item.precioFinal = Number(updates.precioFinal) || 0;
    }

    // CAMPOS DE TEXTO Y FECHA
    if (updates.nombreMaquinaria !== undefined) {
      item.nombreMaquinaria = updates.nombreMaquinaria.trim();
    }
    if (updates.numeroContenedor !== undefined) {
      item.numeroContenedor = updates.numeroContenedor.trim();
    }
    if (updates.fechaCompra !== undefined) {
      item.fechaCompra = updates.fechaCompra;
    }
    if (updates.descripcion !== undefined) {
      item.descripcion = updates.descripcion.trim();
    }
    if (updates.observaciones !== undefined) {
      item.observaciones = updates.observaciones.trim();
    }

    // PROCESAMIENTO CONSERVATIVO DE IMÁGENES
    let finalImages = [];

    // 1. Verificar si el frontend envió una lista explícita de imágenes existentes
    if (updates.existingImages !== undefined) {
      try {
        finalImages = typeof updates.existingImages === "string"
          ? JSON.parse(updates.existingImages)
          : updates.existingImages;
      } catch (e) {
        finalImages = Array.isArray(updates.existingImages)
          ? updates.existingImages
          : [];
      }
    } else {
      // Si el frontend no envió existingImages, conservar las que ya están en la base de datos
      finalImages = item.images && item.images.length > 0 ? [...item.images] : (item.imagenUrl ? [item.imagenUrl] : []);
    }

    // 2. Si se subieron archivos nuevos, subirlos y sumarlos a la lista
    if (req.files && req.files.length > 0) {
      const newUploads = await Promise.all(
        req.files.map((file) => uploadImageToCloudinary(file))
      );
      finalImages = [...finalImages, ...newUploads.filter(Boolean)];
    } else if (req.file) {
      const singleUrl = await uploadImageToCloudinary(req.file);
      if (singleUrl) finalImages.push(singleUrl);
    }

    // 3. Asignar imágenes al objeto antes de guardar
    if (finalImages.length > 0) {
      item.images = finalImages;
      item.imagenUrl = finalImages[0];
    } else {
      // Mantenimiento de respaldo por si finalImages quedaba vacío por error de parseo
      item.images = item.images || [];
      item.imagenUrl = item.imagenUrl || "";
    }

    const updatedInventory = await item.save();

    res.status(200).json(updatedInventory);
  } catch (error) {
    console.error("Error al actualizar el inventario:", error);

    res.status(500).json({
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