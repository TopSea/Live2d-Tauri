// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    CustomMenuItem, Manager, PhysicalPosition, PhysicalSize, Position, Size, SystemTray,
    SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem, WindowBuilder, Wry,
};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_store::{with_store, StoreCollection};

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            let window = app.get_window("main").unwrap();

            // 读取并设置窗口大小和位置的信息
            let stores = app.state::<StoreCollection<Wry>>();
            let mut data = app.path_resolver().resource_dir().unwrap();
            data.push("data/data_src.bin");

            // 窗口大小和位置信息
            let mut win_w: u32 = 0;
            let mut win_h: u32 = 0;
            let mut pos_x: i32 = 0;
            let mut pos_y: i32 = 0;

            let mut click_through: bool = false;
            let mut stay_top: bool = true;
            let mut model_voice: bool = true;

            with_store(app.app_handle(), stores, data, |store| {
                win_w = match store.get("win_w") {
                    None => 1000,
                    Some(json) => json.as_u64().unwrap() as u32,
                };
                win_h = match store.get("win_h") {
                    None => 750,
                    Some(json) => json.as_u64().unwrap() as u32,
                };
                pos_x = match store.get("pos_x") {
                    None => 64,
                    Some(json) => json.as_i64().unwrap() as i32,
                };
                pos_y = match store.get("pos_y") {
                    None => 64,
                    Some(json) => json.as_i64().unwrap() as i32,
                };
                click_through = match store.get("click_through") {
                    None => false,
                    Some(json) => json.as_bool().unwrap(),
                };
                stay_top = match store.get("stay_top") {
                    None => true,
                    Some(json) => json.as_bool().unwrap(),
                };
                model_voice = match store.get("model_voice") {
                    None => true,
                    Some(json) => json.as_bool().unwrap(),
                };
                store.save()
            })
            .unwrap();

            window
                .set_size(Size::Physical(PhysicalSize {
                    width: win_w,
                    height: win_h,
                }))
                .unwrap();
            window
                .set_position(Position::Physical(PhysicalPosition { x: pos_x, y: pos_y }))
                .unwrap();

            // 设置其他信息
            window.set_ignore_cursor_events(click_through).unwrap();
            window.set_always_on_top(stay_top).unwrap();

            // 设置系统托盘
            let m_hide = CustomMenuItem::new("m_hide".to_string(), "Hide");
            let m_stay_on_top = CustomMenuItem::new(
                "m_stay_on_top".to_string(),
                if !stay_top {
                    "Stay On Top"
                } else {
                    "Cancel Stay On Top"
                },
            );
            let m_voice = CustomMenuItem::new(
                "m_voice".to_string(),
                if !model_voice { "Voice" } else { "Mute" },
            );
            let m_click_through = CustomMenuItem::new(
                "m_click_through".to_string(),
                if !click_through {
                    "Click Through"
                } else {
                    "Cancel Click Through"
                },
            );
            let m_save_window = CustomMenuItem::new("m_save_window".to_string(), "Save Window");
            let m_auto_start = CustomMenuItem::new("m_settings".to_string(), "Settings");
            let m_quit = CustomMenuItem::new("m_quit".to_string(), "Quit");

            let tray_menu = SystemTrayMenu::new()
                .add_item(m_hide)
                .add_native_item(SystemTrayMenuItem::Separator)
                .add_item(m_stay_on_top)
                .add_native_item(SystemTrayMenuItem::Separator)
                .add_item(m_voice)
                .add_native_item(SystemTrayMenuItem::Separator)
                .add_item(m_click_through)
                .add_native_item(SystemTrayMenuItem::Separator)
                .add_item(m_save_window)
                .add_native_item(SystemTrayMenuItem::Separator)
                .add_item(m_auto_start)
                .add_native_item(SystemTrayMenuItem::Separator)
                .add_item(m_quit);

            SystemTray::new().with_menu(tray_menu).build(app)?;
            Ok(())
        })
        .on_system_tray_event(move |app, event| match event {
            SystemTrayEvent::RightClick {
                position: _,
                size: _,
                ..
            } => {
                println!("system tray received a right click");
            }
            SystemTrayEvent::MenuItemClick { id, .. } => {
                let item_handle = app.tray_handle().get_item(&id);
                let window = app.get_window("main").unwrap();

                let stores = app.state::<StoreCollection<Wry>>();
                let mut data = app.path_resolver().resource_dir().unwrap();
                data.push("data/data_src.bin");

                match id.as_str() {
                    "m_hide" => {
                        window.hide().unwrap();
                        // you can also `set_selected`, `set_enabled` and `set_native_image` (macOS only).
                        item_handle.set_title("Show").unwrap();
                    }
                    "m_stay_on_top" => {
                        let mut stay_top = false;

                        with_store(app.app_handle(), stores, data, |store| {
                            stay_top = match store.get("stay_top") {
                                None => true,
                                Some(json) => json.as_bool().unwrap(),
                            };
                            store
                                .insert("stay_top".to_string(), serde_json::json!(!stay_top))
                                .unwrap();
                            store.save()
                        })
                        .unwrap();

                        if !stay_top {
                            item_handle.set_title("Stay On Top").unwrap();
                            window.set_always_on_top(false).unwrap();
                        } else {
                            item_handle.set_title("Cancel Stay On Top").unwrap();
                            window.set_always_on_top(true).unwrap();
                        }
                    }
                    "m_voice" => {
                        let mut model_voice = false;

                        with_store(app.app_handle(), stores, data, |store| {
                            model_voice = match store.get("model_voice") {
                                None => true,
                                Some(json) => json.as_bool().unwrap(),
                            };
                            store
                                .insert("model_voice".to_string(), serde_json::json!(!model_voice))
                                .unwrap();
                            store.save()
                        })
                        .unwrap();

                        if !model_voice {
                            item_handle.set_title("Voice").unwrap();
                            window.set_ignore_cursor_events(true).unwrap();
                        } else {
                            item_handle.set_title("Mute").unwrap();
                            window.set_ignore_cursor_events(false).unwrap();
                        }
                    }
                    "m_click_through" => {
                        let mut click_through = false;

                        with_store(app.app_handle(), stores, data, |store| {
                            click_through = match store.get("click_through") {
                                None => false,
                                Some(json) => json.as_bool().unwrap(),
                            };
                            store
                                .insert(
                                    "click_through".to_string(),
                                    serde_json::json!(!click_through),
                                )
                                .unwrap();
                            store.save()
                        })
                        .unwrap();

                        if !click_through {
                            item_handle.set_title("Cancel Click Through").unwrap();
                            window.set_ignore_cursor_events(true).unwrap();
                        } else {
                            item_handle.set_title("Click Through").unwrap();
                            window.set_ignore_cursor_events(false).unwrap();
                        }
                    }
                    "m_save_window" => {
                        let size = window.inner_size().unwrap();
                        let position = window.inner_position().unwrap();

                        with_store(app.app_handle(), stores, data, |store| {
                            let win_w = match store.get("win_w") {
                                None => 1000,
                                Some(json) => json.as_u64().unwrap() as u32,
                            };
                            println!("win_w {}", win_w);

                            store
                                .insert("win_w".to_string(), serde_json::json!(size.width))
                                .unwrap();
                            store
                                .insert("win_h".to_string(), serde_json::json!(size.height))
                                .unwrap();
                            store
                                .insert("pos_x".to_string(), serde_json::json!(position.x))
                                .unwrap();
                            store
                                .insert("pos_y".to_string(), serde_json::json!(position.y))
                                .unwrap();
                            store.save()
                        })
                        .unwrap();
                    }
                    "m_settings" => {
                        WindowBuilder::new(
                            app,
                            "external",
                            tauri::WindowUrl::App("settings.html".into()),
                        )
                        .title("Settings")
                        .inner_size(640.0, 440.0)
                        .position(50.0, 100.0)
                        .build()
                        .unwrap();
                    }
                    "m_quit" => {
                        std::process::exit(0);
                    }
                    _ => {}
                }
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
