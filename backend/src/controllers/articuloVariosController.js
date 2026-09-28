import ArticuloVarios from "../models/ArticuloVarios.js";

const articuloVariosController = {};

// =====================================================
// OBTENER TODOS LOS ARTÍCULOS
// =====================================================
articuloVariosController.getArticulos = async (req, res) => {
  try {
    const items = await ArticuloVarios.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los artículos varios",
      error: error.message,
    });
  }
};

// =====================================================
// OBTENER ARTÍCULO POR ID
// =====================================================
articuloVariosController.getArticuloById = async (req, res) => {
  try {
    const item = await ArticuloVarios.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Artículo no encontrado",
      });
    }

    res.json(item);
  } catch (error) {
    res.status(400).json({
      message: "Error al obtener el artículo",
      error: error.message,
    });
  }
};

// =====================================================
// CREAR ARTÍCULO (NINGÚN CAMPO ES OBLIGATORIO)
// =====================================================
articuloVariosController.createArticulo = async (req, res) => {
  const {
    nombreArticulo,
    precioUnitario,
    impuestos,
    transporte,
    precioFinal,
  } = req.body;

  try {
    const newArticulo = new ArticuloVarios({
      nombreArticulo: nombreArticulo ? nombreArticulo.trim() : "",
      precioUnitario: Number(precioUnitario) || 0,
      impuestos: Number(impuestos) || 0,
      transporte: Number(transporte) || 0,
      precioFinal: Number(precioFinal) || 0,
    });

    const savedArticulo = await newArticulo.save();
    res.status(201).json(savedArticulo);
  } catch (error) {
    console.error("Error al crear artículo varios:", error);
    res.status(500).json({
      message: "Error al crear el artículo varios",
      error: error.message,
    });
  }
};

// =====================================================
// ACTUALIZAR ARTÍCULO
// =====================================================
articuloVariosController.updateArticulo = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  try {
    const item = await ArticuloVarios.findById(id);

    if (!item) {
      return res.status(404).json({
        message: "Artículo no encontrado",
      });
    }

    // Actualización de Nombre (Si aplica)
    if (updates.nombreArticulo !== undefined) {
      item.nombreArticulo = updates.nombreArticulo.trim();
    }

    // Actualización de Campos Numéricos (Independientes)
    if (updates.precioUnitario !== undefined) {
      item.precioUnitario = Number(updates.precioUnitario) || 0;
    }
    if (updates.impuestos !== undefined) {
      item.impuestos = Number(updates.impuestos) || 0;
    }
    if (updates.transporte !== undefined) {
      item.transporte = Number(updates.transporte) || 0;
    }
    if (updates.precioFinal !== undefined) {
      item.precioFinal = Number(updates.precioFinal) || 0;
    }

    const updatedArticulo = await item.save();
    res.status(200).json(updatedArticulo);
  } catch (error) {
    console.error("Error al actualizar el artículo:", error);
    res.status(500).json({
      message: "Error al actualizar el artículo",
      error: error.message,
    });
  }
};

// =====================================================
// ELIMINAR ARTÍCULO
// =====================================================
articuloVariosController.deleteArticulo = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await ArticuloVarios.findById(id);

    if (!item) {
      return res.status(404).json({
        message: "Artículo no encontrado",
      });
    }

    await item.deleteOne();

    res.status(200).json({
      message: "Artículo eliminado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el artículo",
      error: error.message,
    });
  }
};

export default articuloVariosController;