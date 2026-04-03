use tauri::Manager;

#[tauri::command]
fn get_memory_usage() -> u64 {
    // Return approximate process memory in bytes
    // On macOS, we use a simple estimate from the Rust allocator
    0 // Placeholder — will use system APIs in Phase 2
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![get_memory_usage])
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running isA IDE");
}
