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
    const items = await Inventory.find();
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
  if (!file) return "";

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "inventory",

      allowed_formats: ["png", "jpg", "jpeg", "webp"],

      // IMPORTANTE:
      // Ya NO reducimos la imagen a 800x800.
      // Cloudinary conservará la resolución original.
      quality: "auto:best",

      // Evita transformaciones que reduzcan innecesariamente
      // la resolución original.
      resource_type: "image",
    });

    // Eliminar archivo temporal
    await fs.unlink(file.path).catch(() => {});

    return result.secure_url;
  } catch (error) {
    // Intentar eliminar archivo temporal aunque falle Cloudinary
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
    // -------------------------------------------------
    // VALIDACIÓN DE CAMPOS OBLIGATORIOS
    // -------------------------------------------------
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

    // -------------------------------------------------
    // VALIDACIÓN DEL COSTO
    // -------------------------------------------------
    if (
      isNaN(costoMaquinaria) ||
      Number(costoMaquinaria) < 0
    ) {
      return res.status(400).json({
        message:
          "El costo de la maquinaria debe ser un número mayor o igual a 0",
      });
    }

    // -------------------------------------------------
    // SUBIDA DE IMAGEN
    // -------------------------------------------------
    let imagenUrl = "";

    if (req.files && req.files.length > 0) {
      // Actualmente guardamos la primera imagen,
      // manteniendo compatibilidad con tu modelo actual.
      imagenUrl = await uploadImageToCloudinary(req.files[0]);
    } else if (req.file) {
      imagenUrl = await uploadImageToCloudinary(req.file);
    } else if (req.body.imagenUrl) {
      imagenUrl = req.body.imagenUrl;
    }

    // -------------------------------------------------
    // CÁLCULO DEL PRECIO FINAL
    // -------------------------------------------------
    const costoNum = Number(costoMaquinaria) || 0;
    const impuestoNum = Number(impuestoPagado) || 0;
    const transporteNum = Number(costoTransporte) || 0;

    const finalCalculado =
      precioFinal != null
        ? Number(precioFinal)
        : costoNum + impuestoNum + transporteNum;

    // -------------------------------------------------
    // CREAR INVENTARIO
    // -------------------------------------------------
    const newInventory = new Inventory({
      nombreMaquinaria: nombreMaquinaria.trim(),

      descripcion: descripcion
        ? descripcion.trim()
        : "",

      costoMaquinaria: costoNum,

      numeroContenedor: numeroContenedor.trim(),

      fechaCompra,

      impuestoPagado: impuestoNum,

      costoTransporte: transporteNum,

      precioFinal: finalCalculado,

      observaciones: observaciones
        ? observaciones.trim()
        : "",

      imagenUrl,
    });

    const savedInventory = await newInventory.save();

    res.status(201).json(savedInventory);
  } catch (error) {
    console.error(
      "Error al crear elemento en el inventario:",
      error
    );

    res.status(500).json({
      message:
        "Error al crear elemento en el inventario",
      error: error.message,
    });
  }
};

// =====================================================
// ACTUALIZAR INVENTARIO
// =====================================================
inventoryController.updateInventory = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  try {
    // -------------------------------------------------
    // BUSCAR ELEMENTO
    // -------------------------------------------------
    const item = await Inventory.findById(id);

    if (!item) {
      return res.status(404).json({
        message:
          "Elemento de inventario no encontrado",
      });
    }

    // -------------------------------------------------
    // VALIDAR COSTO
    // -------------------------------------------------
    if (updates.costoMaquinaria !== undefined) {
      if (
        isNaN(updates.costoMaquinaria) ||
        Number(updates.costoMaquinaria) < 0
      ) {
        return res.status(400).json({
          message:
            "El costo de la maquinaria debe ser un número válido",
        });
      }

      updates.costoMaquinaria =
        Number(updates.costoMaquinaria);
    }

    // -------------------------------------------------
    // PROCESAR NUEVA IMAGEN
    // -------------------------------------------------
    let nuevaImagenUrl = item.imagenUrl || "";

    if (req.files && req.files.length > 0) {
      nuevaImagenUrl = await uploadImageToCloudinary(
        req.files[0]
      );
    } else if (req.file) {
      nuevaImagenUrl = await uploadImageToCloudinary(
        req.file
      );
    } else if (updates.imagenUrl) {
      nuevaImagenUrl = updates.imagenUrl;
    }

    item.imagenUrl = nuevaImagenUrl;

    // -------------------------------------------------
    // APLICAR ACTUALIZACIONES
    // -------------------------------------------------
    Object.keys(updates).forEach((key) => {
      if (key !== "imagenUrl") {
        item[key] = updates[key];
      }
    });

    // -------------------------------------------------
    // RECALCULAR PRECIO FINAL
    // -------------------------------------------------
    const c =
      Number(item.costoMaquinaria) || 0;

    const i =
      Number(item.impuestoPagado) || 0;

    const t =
      Number(item.costoTransporte) || 0;

    item.precioFinal = c + i + t;

    // -------------------------------------------------
    // GUARDAR
    // -------------------------------------------------
    const updatedInventory =
      await item.save();

    res.status(200).json(updatedInventory);
  } catch (error) {
    console.error(
      "Error al actualizar el inventario:",
      error
    );

    res.status(500).json({
      message:
        "Error al actualizar el inventario",
      error: error.message,
    });
  }
};

// =====================================================
// ELIMINAR INVENTARIO
// =====================================================
inventoryController.deleteInventory = async (
  req,
  res
) => {
  const { id } = req.params;

  try {
    const item = await Inventory.findById(id);

    if (!item) {
      return res.status(404).json({
        message:
          "Elemento de inventario no encontrado",
      });
    }

    await item.deleteOne();

    res.status(200).json({
      message:
        "Elemento de inventario eliminado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Error al eliminar el elemento del inventario",
      error: error.message,
    });
  }
};

export default inventoryController;