<template>
    <div>
        <v-card class="pa-4">
            <v-card-title>Амплитуда</v-card-title>
            <v-data-table
                :headers="headers"
                :items="children"
                :search="search"
                item-key="id"
                v-model:selected="selectedItem"
                show-select
      
                @click:row="handleRowClick"            
                hover
            >
                <template v-slot:item.number>
                    {{ getNumber }}
                </template>
            </v-data-table>
        </v-card>
        {{ drawer }}
        <v-navigation-drawer 
            v-model="drawer" 
            location="right" 
            :width="drawerWidth"
            @mousedown="startResize"
            :permanent="true"
            
        >
            <div class="resize-handle" @mousedown.stop="startResize"></div>
            <v-list nav>
                <v-list-subheader>Описание</v-list-subheader>
                <v-list-item 
                    title="Тест WebSocket" 
                    value="socket-test" 
                    to="/socket-test"
                    prepend-icon="mdi-socket"
                ></v-list-item>
            </v-list>
            {{ selectedItem }}
  
        </v-navigation-drawer>
    </div>
</template>

<script>
import { useSocketStore } from '../stores/socketStore'
import { mapState, mapActions } from 'pinia'

export default {
    data() {
        return {
            search: '',
            headers: [
                { key: 'number', title: '№' },
                {
                    align: 'start',
                    key: 'setvalue',
                    sortable: false,
                    title: 'установленное',
                },
                { key: 'measured', title: 'измеренное', sortable: false },
                { key: 'fat', title: 'Fat (g)', sortable: false },
            ],
            children: [
                { id: 1, setvalue: "step 1", measured: "100", fat: "10" },
                { id: 2, setvalue: "step 2", measured: "200", fat: "20" },
                { id: 3, setvalue: "step 3", measured: "300", fat: "30" }
            ],
            selectedItem: [],
            drawer: false,
            drawerWidth: 500,
            isResizing: false,
            startX: 0,
            startWidth: 0
        }
    },
    computed: {
        ...mapState(useSocketStore, ['isConnected', 'messages']),
        getNumber() { return 1 }
    },
    methods: {
        ...mapActions(useSocketStore, ['sendTestMessage', 'sendControlMessage']),
        startResize(e) {
            this.isResizing = true;
            this.startX = e.clientX;
            this.startWidth = this.drawerWidth;
            
            document.addEventListener('mousemove', this.handleResize);
            document.addEventListener('mouseup', this.stopResize);
            
            e.preventDefault();
        },
        handleResize(e) {
            if (!this.isResizing) return;
            
            const dx = this.startX - e.clientX;
            this.drawerWidth = Math.max(200, Math.min(1920, this.startWidth + dx));
        },
        stopResize() {
            this.isResizing = false;
            document.removeEventListener('mousemove', this.handleResize);
            document.removeEventListener('mouseup', this.stopResize);
        },
        handleRowClick(event, { item }) {
            if (this.selectedItem.includes(item)) {
                this.selectedItem = [];
                 this.drawer = false;
            } else {
                this.selectedItem = [item];
                 this.drawer = true;
            }
        }
    }
}
</script>

<style scoped>
.resize-handle {
    position: absolute;
    top: 0;
    left: -4px;
    width: 8px;
    height: 100%;
    cursor: col-resize;
    z-index: 1;
}

.v-navigation-drawer {
    transition: none !important;
}


</style>