[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/FPIHxdpG)




<div align="center">

<a href="https://portal.lbv.digital" target="_blank" title="LBV-API"><img width="100px" alt="lbv logo" src="frontend\static\media\favicon.svg"></a>
<a name="readme-top"></a>

# **LBV** - **L**erngruppen **B**ildungs- & **V**erwaltungsportal


![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![SQLite](https://img.shields.io/badge/Sqlite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-000000?style=for-the-badge&logo=sqlalchemy&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)
![Bcrypt](https://img.shields.io/badge/Bcrypt-004880?style=for-the-badge&logo=bcrypt&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
</div>

## Beschreibung

Das LBV-Portal ist eine Webanwendung, die es ermöglicht, Lerngruppen zu erstellen, zu verwalten und an diesen teilzunehmen. Das Backend ist in Python mit Flask und SQLAlchemy geschrieben und das Frontend ist in HTML, CSS und JavaScript mit Bootstrap geschrieben. Die Anwendung verwendet eine SQLite-Datenbank und die Benutzerauthentifizierung erfolgt über JWT und Bcrypt.

## Aufbau

Da das Backend eine REST-API ist, und somit unabhängig funktionierten (würde), wurde es in einem [seperaten Repository](https://github.com/jexxme/groupManagementAPI/) erstellt. 

Das Frontend ist in dem aktuellen Repository enthalten. 

Die Einbindung des Backends in dieses Repsitory erfolgt über ein Submodul. Das Backend-Repository kann [hier](https://github.com/jexxme/groupManagementAPI/) gefunden werden.

## Öffentliche Demo

Das LBV-Portal sowie die LBV-API sind auf einer kostenlosen AWS-Instanz gehostet. Die Einrichtung dieser Instanz ist [hier](https://github.com/jexxme/groupManagementAPI/tree/main?tab=readme-ov-file#%C3%B6ffentliche-api) dokumentiert.

### Frontend

Das Portal (für Schüler & Lehrer) ist unter [https://portal.lbv.digital](https://portal.lbv.digital) erreichbar.

Mit GSO.schule.koeln E-Mail-Adresse registrieren und einloggen.

ODER

Zugangsdaten Admin: admin@admin.admin - admin
Zugangsdaten User: user@gso.schule.koeln - user

### Backend

Die API (bzw. das Admin Dashboard) ist unter [https://lbv.digital](https://lbv.digital). 

Zugangsdaten: admin@admin.admin - admin

## Installation

### Voraussetzungen

- Python 3.8 oder höher
- Pip

### Schritte

1. Klonen Sie das Repository
   ```sh
   git clone
    ```

2. Wechseln Sie in das Verzeichnis
    ```sh
    cd code-repository-osp-gruppen-fi107-osp_gruppe4
    ```
3. Installieren Sie das Submodul (Backend)
    ```sh
    git submodule update --init
    ```

4. Installieren Sie die Abhängigkeiten (Front und Backend)
    ```sh
    pip install -r requirements.txt
    ```

5. Starten Sie die Anwendung
    ```sh
    python backend/run.py

    python frontend/app.py
    ```