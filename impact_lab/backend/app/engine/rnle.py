"""
MINSAL RNLE (Registro Nacional de Listas de Espera) Exit Causals & Transition Rules.
"""

RNLE_EXIT_CAUSALS = {
    0: "GES (traspaso a SIGGES)",
    1: "Atención Realizada",
    2: "Procedimiento Informado",
    4: "Extra-sistema",
    5: "No Beneficiario / Cambio Asegurador",
    6: "Renuncia o Rechazo Voluntario",
    7: "Recuperación Espontánea",
    8: "Inasistencia",
    9: "Fallecimiento",
    11: "Contacto No Corresponde",
    12: "No Corresponde Realizar Cirugía",
    14: "No Pertinencia Médica"
}

def validate_exit_causal(code: int) -> bool:
    return code in RNLE_EXIT_CAUSALS
