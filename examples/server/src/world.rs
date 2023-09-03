use hashbrown::HashMap;
use serde::Serialize;
use voxelize::{
    BlockAccess, BlockIdentity, BlockRegistry, Chunk, ChunkManager, ChunkOptions, ChunkStage, Face,
    Mesher, MesherRegistry, SixFacesBuilder, Space, TextureAtlas, Vec3, World,
};
use voxelize_protocol::{GeometryData, Packet, PacketType};

use crate::block::{self, Block};

pub struct TestStage;

impl ChunkStage for TestStage {
    fn name(&self) -> String {
        "Test Stage".to_string()
    }

    fn process(&self, mut chunk: Chunk) -> Chunk {
        let Vec3(x, y, z) = chunk.min;
        let chunk_size = chunk.options.chunk_size;

        println!("Going through test stage: {:?}", chunk.coords);

        for vx in x..x + chunk_size as i32 {
            for vz in z..z + chunk_size as i32 {
                chunk.set_block_id(vx, 0, vz, 1);
            }
        }

        chunk
    }
}

#[derive(Clone, Serialize)]
pub struct TestWorldInitData {
    name: String,
    atlas: Vec<(String, Vec<Face>)>,
}

pub struct TestWorld<T: BlockIdentity + Clone> {
    clients: Vec<String>,
    id: String,
    atlas: TextureAtlas,
    pub chunk_manager: ChunkManager<T>,
    pub packets: Vec<(String, Vec<Packet>)>,
}

pub struct BlockMesher;

impl Mesher<Block> for BlockMesher {
    fn is_applicable(&self, block_id: u32) -> bool {
        block_id != 0
    }

    fn mesh(
        &self,
        voxel: &Vec3<i32>,
        block_access: &dyn BlockAccess,
        registry: &BlockRegistry<Block>,
    ) -> Vec<GeometryData> {
        let &Vec3(vx, vy, vz) = voxel;
        let block_id: u32 = block_access.get_block_id(vx, vy, vz);

        vec![GeometryData::new(block_id).build()]
    }
}

impl Default for TestWorld<Block> {
    fn default() -> Self {
        let chunk_options = ChunkOptions::new(16, 256, 4, 16);

        let air = Block::new(0, "air").build();
        let stone = Block::new(1, "stone").build();
        let dirt = Block::new(2, "dirt").build();

        let block_registry = BlockRegistry::with_blocks(vec![air, stone, dirt]);

        let mut mesher_registry = MesherRegistry::new();
        mesher_registry.register(BlockMesher);

        let six_faces = SixFacesBuilder::new().build();

        let mut texture_atlas = TextureAtlas::new();
        texture_atlas.add_faces("stone", &six_faces);
        texture_atlas.add_faces("dirt", &six_faces);
        texture_atlas.generate();

        let mut chunk_manager = ChunkManager::new(block_registry, mesher_registry, &chunk_options);

        chunk_manager.start_job_processor(8);
        chunk_manager.add_stage(TestStage);

        Self {
            clients: vec![],
            id: "test".to_string(),
            atlas: texture_atlas,
            chunk_manager,
            packets: vec![],
        }
    }
}

impl World for TestWorld<Block> {
    fn id(&self) -> &str {
        &self.id
    }

    fn name(&self) -> &str {
        "Test World"
    }

    fn clients(&self) -> Vec<&str> {
        self.clients.iter().map(|s| s.as_str()).collect()
    }

    fn add_client(&mut self, client_id: &str) {
        self.clients.push(client_id.to_string());

        // Send the init packet to the client
        self.packets.push((
            client_id.to_string(),
            vec![Packet::new(PacketType::Init)
                .json(TestWorldInitData {
                    name: self.name().to_string(),
                    atlas: self
                        .atlas
                        .groups
                        .iter()
                        .map(|(k, v)| (k.clone(), v.clone()))
                        .collect(),
                })
                .build()],
        ))
    }

    fn remove_client(&mut self, client_id: &str) {
        self.clients.retain(|s| s != client_id);
    }

    fn packets(&mut self) -> Vec<(String, Vec<Packet>)> {
        self.packets.drain(..).collect()
    }

    fn on_packet(&mut self, client_id: &str, packet: Packet) {
        println!("{}: {:?}", client_id, packet);
    }

    fn update(&mut self) {
        self.chunk_manager.update();

        let done_jobs = self.chunk_manager.get_done_jobs();

        for job in done_jobs {
            let coords = job.coords;
            let chunk = self.chunk_manager.chunks.get(&coords);

            if let Some(chunk) = chunk {
                println!("Chunk status: {:?}", chunk.status);

                let Vec3(x, y, z) = chunk.min;
                println!("Block at 0, 0, 0: {}", chunk.get_block_id(x, y, z));
            }
        }
    }
}
